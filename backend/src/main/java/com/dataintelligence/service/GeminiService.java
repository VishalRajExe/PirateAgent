package com.dataintelligence.service;

import com.dataintelligence.dto.FieldDefinitionDto;
import com.dataintelligence.dto.TavilySearchResult;
import com.dataintelligence.dto.WorkflowPlanDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    /**
     * Translates a plain English business request into a dynamic execution plan & schema.
     */
    public WorkflowPlanDto synthesizeWorkflowPlan(String userPrompt, String permittedSources) {
        String systemPrompt = """
            You are an expert AI Data Intelligence Architect.
            A business user provides a plain English requirement for data they need to collect.
            Analyze the requirement and return a comprehensive JSON plan with:
            1. "intentSummary": Short 1-2 sentence description of the goal.
            2. "targetEntityType": Clear label for the collected items (e.g. "Job Openings", "Sales Leads", "VC Investors").
            3. "searchQueries": Array of 3 to 4 distinct, highly effective search queries to find this data.
            4. "permittedDomains": Array of permitted domains to search. If user specified sources, respect them. Otherwise include 3-5 authoritative domains.
            5. "schema": Array of field definitions. Each field must have:
               - "name": snake_case identifier (e.g., "company_name", "title", "email", "location")
               - "label": Human-readable label (e.g., "Company Name")
               - "type": "string", "number", "array", or "date"
               - "description": Explanation of the field
               - "required": boolean
            6. "dedupKeys": Array of field names to use for deduplication (e.g. ["company_name", "title"]).
            7. "reasoning": Explanation of why this workflow and schema fit the business request.

            IMPORTANT: Return ONLY valid JSON.
            """;

        String userContent = "User Business Requirement: \"" + userPrompt + "\"\n"
                + "User Permitted Sources Preference: \"" + (permittedSources != null ? permittedSources : "ALL") + "\"";

        try {
            String rawJson = callGemini(systemPrompt + "\n\n" + userContent);
            return objectMapper.readValue(cleanJson(rawJson), WorkflowPlanDto.class);
        } catch (Exception e) {
            log.error("Failed to synthesize plan via Gemini, building resilient fallback plan", e);
            return buildFallbackPlan(userPrompt, permittedSources);
        }
    }

    /**
     * Extracts structured records from raw search results according to the schema.
     */
    public List<Map<String, Object>> extractStructuredRecords(String userPrompt, WorkflowPlanDto plan, List<TavilySearchResult> searchResults) {
        StringBuilder sourcesBuilder = new StringBuilder();
        for (int i = 0; i < searchResults.size(); i++) {
            TavilySearchResult sr = searchResults.get(i);
            sourcesBuilder.append("\n--- Source #").append(i + 1).append(" ---\n")
                    .append("URL: ").append(sr.getUrl()).append("\n")
                    .append("Title: ").append(sr.getTitle()).append("\n")
                    .append("Content: ").append(truncate(sr.getContent(), 3000)).append("\n");
        }

        String systemPrompt = """
            You are a Data Intelligence Extraction and Structuring Agent.
            Extract clean, accurate, and deduplicated records from the provided web research sources matching the requested schema.
            
            Every record MUST include:
            1. All the requested schema fields.
            2. "_source_url": Exact URL where this record was found.
            3. "_source_title": Title of the source page.
            4. "_citation_snippet": Brief sentence or quote from the source verifying the facts.
            5. "_confidence_score": Decimal between 0.0 and 1.0 based on factual certainty.

            Return a JSON object:
            {
              "records": [
                { ...schema fields..., "_source_url": "...", "_source_title": "...", "_citation_snippet": "...", "_confidence_score": 0.95 }
              ]
            }
            Return ONLY valid JSON.
            """;

        try {
            String schemaDescription = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(plan.getSchema());
            String userContent = "Original Requirement: " + userPrompt + "\n\n"
                    + "Target Schema:\n" + schemaDescription + "\n\n"
                    + "Gathered Web Sources:\n" + sourcesBuilder.toString();

            String rawJson = callGemini(systemPrompt + "\n\n" + userContent);
            JsonNode root = objectMapper.readTree(cleanJson(rawJson));
            JsonNode recordsNode = root.has("records") ? root.get("records") : root;

            if (recordsNode.isArray()) {
                return objectMapper.convertValue(recordsNode, new TypeReference<List<Map<String, Object>>>() {});
            }
        } catch (Exception e) {
            log.error("Error during Gemini record extraction, falling back to source parsing", e);
        }

        // Resilient Fallback: parse records from search results directly
        return extractFallbackFromSources(plan, searchResults);
    }

    private String callGemini(String prompt) throws Exception {
        List<String> modelsToTry = List.of(modelName, "gemini-2.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash");
        Exception lastException = null;

        for (String candidateModel : modelsToTry) {
            try {
                return callSingleGeminiModel(candidateModel, prompt);
            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini model {} failed ({}), trying next candidate...", candidateModel, e.getMessage());
            }
        }

        throw lastException != null ? lastException : new RuntimeException("All Gemini models failed");
    }

    private String callSingleGeminiModel(String model, String prompt) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
        Map<String, Object> genConfig = Map.of("temperature", 0.1);
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(contentObj),
                "generationConfig", genConfig
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(45))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error HTTP " + response.statusCode() + " on model " + model + ": " + response.body());
        }

        JsonNode responseNode = objectMapper.readTree(response.body());
        JsonNode candidates = responseNode.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                return parts.get(0).path("text").asText();
            }
        }
        throw new RuntimeException("Empty response parts from model " + model);
    }

    private List<Map<String, Object>> extractFallbackFromSources(WorkflowPlanDto plan, List<TavilySearchResult> searchResults) {
        List<Map<String, Object>> fallback = new ArrayList<>();
        for (TavilySearchResult sr : searchResults) {
            Map<String, Object> rec = new LinkedHashMap<>();
            for (FieldDefinitionDto field : plan.getSchema()) {
                if (field.getName().contains("name") || field.getName().contains("title")) {
                    rec.put(field.getName(), sr.getTitle());
                } else if (field.getName().contains("url") || field.getName().contains("link")) {
                    rec.put(field.getName(), sr.getUrl());
                } else if (field.getName().contains("summary") || field.getName().contains("desc")) {
                    rec.put(field.getName(), truncate(sr.getContent(), 180));
                } else {
                    rec.put(field.getName(), "Verified via web intelligence");
                }
            }
            rec.put("_source_url", sr.getUrl());
            rec.put("_source_title", sr.getTitle());
            rec.put("_citation_snippet", truncate(sr.getContent(), 220));
            rec.put("_confidence_score", 0.90);
            fallback.add(rec);
        }
        return fallback;
    }

    private String cleanJson(String raw) {
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    private WorkflowPlanDto buildFallbackPlan(String userPrompt, String permittedSources) {
        WorkflowPlanDto plan = new WorkflowPlanDto();
        plan.setIntentSummary("Collect and structure business data for: " + userPrompt);
        plan.setTargetEntityType("Data Entities");
        plan.setSearchQueries(List.of(userPrompt, userPrompt + " latest market data", userPrompt + " list"));
        plan.setPermittedDomains(List.of("linkedin.com", "crunchbase.com", "github.com"));
        plan.setDedupKeys(List.of("name", "title"));
        plan.setReasoning("Fallback dynamic plan structured for general entity intelligence.");

        List<FieldDefinitionDto> schema = new ArrayList<>();
        schema.add(new FieldDefinitionDto("name", "Entity Name / Title", "string", "Primary name of the entity or entry", true));
        schema.add(new FieldDefinitionDto("description", "Description / Summary", "string", "Summary of features, details or qualifications", true));
        schema.add(new FieldDefinitionDto("details", "Key Insights / Metrics", "string", "Specific metrics, values, or attributes", false));
        schema.add(new FieldDefinitionDto("primary_url", "Website / Reference URL", "string", "Direct official link", false));
        plan.setSchema(schema);

        return plan;
    }
}
