package com.dataintelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "datasets")
public class Dataset {

    @Id
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private IntelligenceTask task;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String schemaJson; // Array of ColumnDefinition: name, type, description, required

    private int totalRecords;
    private int duplicateCount;
    private double averageConfidence;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DatasetRecord> records = new ArrayList<>();

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SourceCitation> sources = new ArrayList<>();

    public Dataset() {
        this.createdAt = LocalDateTime.now();
    }

    public void addRecord(DatasetRecord record) {
        records.add(record);
        record.setDataset(this);
    }

    public void addSource(SourceCitation source) {
        sources.add(source);
        source.setDataset(this);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public IntelligenceTask getTask() { return task; }
    public void setTask(IntelligenceTask task) { this.task = task; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSchemaJson() { return schemaJson; }
    public void setSchemaJson(String schemaJson) { this.schemaJson = schemaJson; }

    public int getTotalRecords() { return totalRecords; }
    public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

    public int getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; }

    public double getAverageConfidence() { return averageConfidence; }
    public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DatasetRecord> getRecords() { return records; }
    public void setRecords(List<DatasetRecord> records) { this.records = records; }

    public List<SourceCitation> getSources() { return sources; }
    public void setSources(List<SourceCitation> sources) { this.sources = sources; }
}
