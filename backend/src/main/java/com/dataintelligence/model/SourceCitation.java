package com.dataintelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "source_citations")
public class SourceCitation {

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
    private String url;

    private String domain;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    private int recordsExtracted;

    public SourceCitation() {}

    public SourceCitation(Dataset dataset, String url, String domain, String title, String snippet, int recordsExtracted) {
        this.dataset = dataset;
        this.url = url;
        this.domain = domain;
        this.title = title;
        this.snippet = snippet;
        this.recordsExtracted = recordsExtracted;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public Dataset getDataset() { return dataset; }
    public void setDataset(Dataset dataset) { this.dataset = dataset; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public int getRecordsExtracted() { return recordsExtracted; }
    public void setRecordsExtracted(int recordsExtracted) { this.recordsExtracted = recordsExtracted; }
}
