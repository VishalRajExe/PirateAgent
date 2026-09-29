package com.dataintelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "dataset_records")
public class DatasetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id")
    @JsonIgnore
    private Dataset dataset;

    @Column(name = "dataset_id", insertable = false, updatable = false)
    private String datasetId;

    @Column(columnDefinition = "TEXT")
    private String dataJson; // Map<String, Object> serialized to JSON

    private double confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(columnDefinition = "TEXT")
    private String sourceTitle;

    @Column(columnDefinition = "TEXT")
    private String citationSnippet;

    private boolean isValid;

    public DatasetRecord() {
        this.isValid = true;
        this.confidenceScore = 0.95;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public Dataset getDataset() { return dataset; }
    public void setDataset(Dataset dataset) { this.dataset = dataset; }

    public String getDataJson() { return dataJson; }
    public void setDataJson(String dataJson) { this.dataJson = dataJson; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourceTitle() { return sourceTitle; }
    public void setSourceTitle(String sourceTitle) { this.sourceTitle = sourceTitle; }

    public String getCitationSnippet() { return citationSnippet; }
    public void setCitationSnippet(String citationSnippet) { this.citationSnippet = citationSnippet; }

    public boolean isValid() { return isValid; }
    public void setValid(boolean valid) { isValid = valid; }
}
