package com.dataintelligence.service;

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
import java.util.concurrent.TimeUnit;

/**
 * Calls the local LangGraph enrichment agent at :2024.
 *
 * Flow:
 *   1. POST /threads           → create a new thread
 *   2. POST /threads/{id}/runs → kick off the "agent" graph
 *   3. Poll GET /threads/{id}/runs/{runId} until status = "success" or "error"
 *   4. GET /threads/{id}/state → retrieve the final extracted `info` field
 */
@Service
public class LangGraphService {

    private static final Logger log = LoggerFactory.getLogger(LangGraphService.class);

    @Value("${langgraph.enabled:true}")
    private boolean enabled;

    @Value("${langgraph.base-url:http://127.0.0.1:2024}")
    private String baseUrl;

    @Value("${langgraph.poll-interval-ms:2000}")
    private long pollIntervalMs;

    @Value("${langgraph.max-wait-seconds:15}")
    private long maxWaitSeconds;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    /**
     * Run the LangGraph enrichment agent for a given topic and JSON schema.
     *
     * @param topic           the research topic / natural-language prompt
     * @param extractionSchema JSON schema (as a Map) describing the fields to extract
     * @return extracted info map from the agent, or empty map on failure
     */
    public Map<String, Object> runEnrichmentAgent(String topic, Map<String, Object> extractionSchema) {
        if (!enabled) {
            log.info("[LangGraph] Enrichment disabled by configuration.");
            return Collections.emptyMap();
        }

        try {
            // Step 1: Create thread
            String threadId = createThread();
            log.info("[LangGraph] Created thread: {}", threadId);

            // Step 2: Submit run
            Map<String, Object> input = Map.of(
                    "topic", topic,
                    "extraction_schema", extractionSchema
            );
            String runId = submitRun(threadId, input);
            log.info("[LangGraph] Submitted run: {} on thread: {}", runId, threadId);

            // Step 3: Poll for completion
            String finalStatus = pollUntilDone(threadId, runId);
            log.info("[LangGraph] Run {} finished with status: {}", runId, finalStatus);

            if (!"success".equalsIgnoreCase(finalStatus)) {
                log.warn("[LangGraph] Run ended with non-success status: {}", finalStatus);
                return Collections.emptyMap();
            }

            // Step 4: Retrieve state
            return getThreadState(threadId);

        } catch (Exception e) {
            log.warn("[LangGraph] Agent invocation skipped: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private String createThread() throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/threads"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(5))
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200 && resp.statusCode() != 201) {
            throw new RuntimeException("Failed to create LangGraph thread: HTTP " + resp.statusCode());
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> body = mapper.readValue(resp.body(), Map.class);
        return (String) body.get("thread_id");
    }

    @SuppressWarnings("unchecked")
    private String submitRun(String threadId, Map<String, Object> input) throws Exception {
        Map<String, Object> payload = Map.of(
                "assistant_id", "agent",
                "input", input
        );
        String json = mapper.writeValueAsString(payload);
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/threads/" + threadId + "/runs"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(5))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200 && resp.statusCode() != 201) {
            throw new RuntimeException("Failed to submit LangGraph run: HTTP " + resp.statusCode());
        }
        Map<String, Object> body = mapper.readValue(resp.body(), Map.class);
        return (String) body.get("run_id");
    }

    @SuppressWarnings("unchecked")
    private String pollUntilDone(String threadId, String runId) throws Exception {
        long deadline = System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(maxWaitSeconds);
        while (System.currentTimeMillis() < deadline) {
            TimeUnit.MILLISECONDS.sleep(pollIntervalMs);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/threads/" + threadId + "/runs/" + runId))
                    .timeout(Duration.ofSeconds(5))
                    .GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                Map<String, Object> body = mapper.readValue(resp.body(), Map.class);
                String status = (String) body.get("status");
                if ("success".equalsIgnoreCase(status) || "error".equalsIgnoreCase(status)) {
                    return status;
                }
                log.debug("[LangGraph] Run {} status: {}", runId, status);
            }
        }
        return "timeout";
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getThreadState(String threadId) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/threads/" + threadId + "/state"))
                .timeout(Duration.ofSeconds(5))
                .GET().build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            log.warn("[LangGraph] Could not get thread state: HTTP {}", resp.statusCode());
            return Collections.emptyMap();
        }
        Map<String, Object> body = mapper.readValue(resp.body(), Map.class);
        Object values = body.get("values");
        if (values instanceof Map) {
            Object info = ((Map<?, ?>) values).get("info");
            if (info instanceof Map) {
                return (Map<String, Object>) info;
            }
        }
        return Collections.emptyMap();
    }

    /**
     * Build a JSON Schema map from a list of field definitions (as returned by Gemini planning).
     */
    public Map<String, Object> buildExtractionSchema(String entityType, List<Map<String, Object>> fields) {
        Map<String, Object> properties = new LinkedHashMap<>();
        List<String> required = new ArrayList<>();
        for (Map<String, Object> field : fields) {
            String name = (String) field.get("name");
            String type = "number".equalsIgnoreCase((String) field.get("type")) ? "number" : "string";
            boolean req = Boolean.TRUE.equals(field.get("required"));
            String desc = (String) field.getOrDefault("description", name);
            properties.put(name, Map.of("type", type, "description", desc));
            if (req) required.add(name);
        }
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("title", entityType != null ? entityType : "Entity");
        schema.put("description", "Structured data for " + entityType);
        schema.put("properties", properties);
        schema.put("required", required);
        return schema;
    }
}
