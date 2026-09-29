package com.dataintelligence.dto;

import com.dataintelligence.model.SourceCitation;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DatasetDetailResponse {
    private String id;
    private String taskId;
    private String title;
    private String description;
    private List<FieldDefinitionDto> schema;
    private int totalRecords;
    private int duplicateCount;
    private double averageConfidence;
    private LocalDateTime createdAt;
    private List<Map<String, Object>> records;
    private List<SourceCitation> sources;

    public DatasetDetailResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<FieldDefinitionDto> getSchema() { return schema; }
    public void setSchema(List<FieldDefinitionDto> schema) { this.schema = schema; }

    public int getTotalRecords() { return totalRecords; }
    public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

    public int getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; }

    public double getAverageConfidence() { return averageConfidence; }
    public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Map<String, Object>> getRecords() { return records; }
    public void setRecords(List<Map<String, Object>> records) { this.records = records; }

    public List<SourceCitation> getSources() { return sources; }
    public void setSources(List<SourceCitation> sources) { this.sources = sources; }
}
