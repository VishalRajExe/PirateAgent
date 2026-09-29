package com.dataintelligence.service;

import com.dataintelligence.dto.TavilySearchResult;
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
public class TavilyService {

    private static final Logger log = LoggerFactory.getLogger(TavilyService.class);

    @Value("${tavily.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    /**
     * Executes web search across permitted domains using Tavily.
     */
    public List<TavilySearchResult> search(String query, List<String> permittedDomains, int maxResults) {
        List<TavilySearchResult> results = new ArrayList<>();
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("api_key", apiKey);
            requestBody.put("query", query);
            requestBody.put("search_depth", "advanced");
            requestBody.put("max_results", maxResults > 0 ? maxResults : 5);

            if (permittedDomains != null && !permittedDomains.isEmpty() && !permittedDomains.contains("ALL")) {
                List<String> cleanDomains = permittedDomains.stream()
                        .map(d -> d.trim().replace("https://", "").replace("http://", "").split("/")[0])
                        .filter(d -> !d.isBlank())
                        .toList();
                if (!cleanDomains.isEmpty()) {
                    requestBody.put("include_domains", cleanDomains);
                }
            }

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.tavily.com/search"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode resultsNode = root.path("results");
                if (resultsNode.isArray()) {
                    for (JsonNode item : resultsNode) {
                        String title = item.path("title").asText("");
                        String url = item.path("url").asText("");
                        String content = item.path("content").asText("");
                        double score = item.path("score").asDouble(0.85);
                        results.add(new TavilySearchResult(title, url, content, score));
                    }
                }
            } else {
                log.warn("Tavily search API responded with code: {}, body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed executing Tavily search query: {}", query, e);
        }

        return results;
    }
}
