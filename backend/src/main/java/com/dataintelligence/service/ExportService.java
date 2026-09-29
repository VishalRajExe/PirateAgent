package com.dataintelligence.service;

import com.dataintelligence.dto.DatasetDetailResponse;
import com.dataintelligence.dto.FieldDefinitionDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExportService {

    private final TaskService taskService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ExportService(TaskService taskService) {
        this.taskService = taskService;
    }

    public String exportToCsv(String taskId) {
        DatasetDetailResponse dataset = taskService.getDatasetByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Dataset not found for task: " + taskId));

        StringBuilder csv = new StringBuilder();
        List<FieldDefinitionDto> schema = dataset.getSchema();
        if (schema == null || schema.isEmpty()) {
            return "No schema defined for this dataset\n";
        }

        // CSV Header
        for (int i = 0; i < schema.size(); i++) {
            csv.append("\"").append(escapeQuotes(schema.get(i).getLabel())).append("\"");
            csv.append(i < schema.size() - 1 ? "," : "");
        }
        csv.append(",\"Source URL\",\"Confidence\"\n");

        // CSV Rows
        for (Map<String, Object> record : dataset.getRecords()) {
            for (int i = 0; i < schema.size(); i++) {
                String key = schema.get(i).getName();
                Object val = record.get(key);
                String strVal = val != null ? val.toString() : "";
                csv.append("\"").append(escapeQuotes(strVal)).append("\"");
                csv.append(i < schema.size() - 1 ? "," : "");
            }
            csv.append(",\"").append(escapeQuotes(record.getOrDefault("_source_url", "").toString())).append("\"");
            csv.append(",\"").append(record.getOrDefault("_confidence_score", "0.95")).append("\"\n");
        }

        return csv.toString();
    }

    public String exportToJson(String taskId) {
        DatasetDetailResponse dataset = taskService.getDatasetByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Dataset not found for task: " + taskId));

        try {
            // Build a clean, serializable map to avoid JPA circular reference issues on SourceCitation
            Map<String, Object> export = new LinkedHashMap<>();
            export.put("id", dataset.getId());
            export.put("taskId", dataset.getTaskId());
            export.put("title", dataset.getTitle());
            export.put("description", dataset.getDescription());
            export.put("totalRecords", dataset.getTotalRecords());
            export.put("duplicateCount", dataset.getDuplicateCount());
            export.put("averageConfidence", dataset.getAverageConfidence());
            export.put("createdAt", dataset.getCreatedAt() != null ? dataset.getCreatedAt().toString() : null);
            export.put("schema", dataset.getSchema());

            // Clean records (already Map<String, Object>, safe)
            export.put("records", dataset.getRecords());

            // Clean sources as simple maps to avoid lazy-load / cycle issues
            if (dataset.getSources() != null) {
                var sourceMaps = dataset.getSources().stream().map(s -> {
                    Map<String, Object> sm = new LinkedHashMap<>();
                    sm.put("id", s.getId());
                    sm.put("url", s.getUrl());
                    sm.put("domain", s.getDomain());
                    sm.put("title", s.getTitle());
                    sm.put("snippet", s.getSnippet());
                    sm.put("recordsExtracted", s.getRecordsExtracted());
                    return sm;
                }).toList();
                export.put("sources", sourceMaps);
            }

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(export);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize dataset to JSON: " + e.getMessage(), e);
        }
    }

    private String escapeQuotes(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
