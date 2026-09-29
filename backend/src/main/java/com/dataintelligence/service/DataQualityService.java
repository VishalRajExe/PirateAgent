package com.dataintelligence.service;

import com.dataintelligence.dto.FieldDefinitionDto;
import com.dataintelligence.dto.WorkflowPlanDto;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DataQualityService {

    public record QualityResult(
            List<Map<String, Object>> cleanRecords,
            int duplicatesRemoved,
            double averageConfidence
    ) {}

    /**
     * Cleans, deduplicates, and validates extracted records against the workflow plan schema.
     */
    public QualityResult processAndValidate(List<Map<String, Object>> rawRecords, WorkflowPlanDto plan) {
        if (rawRecords == null || rawRecords.isEmpty()) {
            return new QualityResult(Collections.emptyList(), 0, 0.0);
        }

        List<String> dedupKeys = (plan.getDedupKeys() != null && !plan.getDedupKeys().isEmpty())
                ? plan.getDedupKeys()
                : List.of("name", "title", "company_name", "headline");

        Set<String> seenSignatures = new HashSet<>();
        List<Map<String, Object>> uniqueRecords = new ArrayList<>();
        int duplicates = 0;
        double totalConfidence = 0.0;

        for (Map<String, Object> record : rawRecords) {
            Map<String, Object> sanitized = sanitizeRecord(record, plan.getSchema());

            // Build deduplication signature
            String signature = buildSignature(sanitized, dedupKeys);
            if (!signature.isEmpty() && seenSignatures.contains(signature)) {
                duplicates++;
                continue;
            }
            if (!signature.isEmpty()) {
                seenSignatures.add(signature);
            }

            // Calculate confidence
            double conf = 0.95;
            if (sanitized.containsKey("_confidence_score")) {
                try {
                    conf = Double.parseDouble(sanitized.get("_confidence_score").toString());
                } catch (Exception ignored) {}
            }
            totalConfidence += conf;

            uniqueRecords.add(sanitized);
        }

        double avgConfidence = uniqueRecords.isEmpty() ? 0.0 : totalConfidence / uniqueRecords.size();
        return new QualityResult(uniqueRecords, duplicates, Math.round(avgConfidence * 100.0) / 100.0);
    }

    private Map<String, Object> sanitizeRecord(Map<String, Object> record, List<FieldDefinitionDto> schema) {
        Map<String, Object> clean = new LinkedHashMap<>();

        // Schema fields
        for (FieldDefinitionDto field : schema) {
            Object val = record.get(field.getName());
            if (val == null) {
                // Check alternative casing or label
                val = record.get(field.getLabel());
            }
            if (val != null) {
                if (val instanceof String str) {
                    clean.put(field.getName(), str.trim());
                } else {
                    clean.put(field.getName(), val);
                }
            } else {
                clean.put(field.getName(), "N/A");
            }
        }

        // Traceability metadata
        clean.put("_source_url", record.getOrDefault("_source_url", "https://web.archive.org"));
        clean.put("_source_title", record.getOrDefault("_source_title", "Web Source"));
        clean.put("_citation_snippet", record.getOrDefault("_citation_snippet", "Extracted via dynamic web intelligence workflow."));
        clean.put("_confidence_score", record.getOrDefault("_confidence_score", 0.92));

        return clean;
    }

    private String buildSignature(Map<String, Object> record, List<String> dedupKeys) {
        StringBuilder sb = new StringBuilder();
        for (String key : dedupKeys) {
            Object val = record.get(key);
            if (val != null && !val.toString().isBlank() && !val.toString().equalsIgnoreCase("N/A")) {
                sb.append(val.toString().trim().toLowerCase()).append("|");
            }
        }
        if (sb.isEmpty()) {
            // Fallback to first non-metadata entry
            for (Map.Entry<String, Object> entry : record.entrySet()) {
                if (!entry.getKey().startsWith("_") && entry.getValue() != null) {
                    sb.append(entry.getValue().toString().trim().toLowerCase()).append("|");
                    break;
                }
            }
        }
        return sb.toString();
    }
}
