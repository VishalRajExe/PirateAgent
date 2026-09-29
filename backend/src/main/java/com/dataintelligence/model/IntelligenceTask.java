package com.dataintelligence.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "intelligence_tasks")
public class IntelligenceTask {

    @Id
    private String id;

    @Column(columnDefinition = "TEXT")
    private String userPrompt;

    @Column(nullable = false)
    private String status; // PENDING, PLANNING, SEARCHING, EXTRACTING, DEDUPLICATING, COMPLETED, FAILED

    private int progress; // 0 to 100

    private String currentStep;

    @Column(columnDefinition = "TEXT")
    private String permittedSources;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String workflowPlanJson;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    private List<TaskLog> logs = new ArrayList<>();

    @OneToOne(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Dataset dataset;

    public IntelligenceTask() {
        this.createdAt = LocalDateTime.now();
        this.progress = 0;
        this.status = "PENDING";
    }

    public void addLog(String step, String message, String level) {
        TaskLog log = new TaskLog(this, step, message, level);
        this.logs.add(log);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserPrompt() { return userPrompt; }
    public void setUserPrompt(String userPrompt) { this.userPrompt = userPrompt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public String getPermittedSources() { return permittedSources; }
    public void setPermittedSources(String permittedSources) { this.permittedSources = permittedSources; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getWorkflowPlanJson() { return workflowPlanJson; }
    public void setWorkflowPlanJson(String workflowPlanJson) { this.workflowPlanJson = workflowPlanJson; }

    public List<TaskLog> getLogs() { return logs; }
    public void setLogs(List<TaskLog> logs) { this.logs = logs; }

    public Dataset getDataset() { return dataset; }
    public void setDataset(Dataset dataset) { this.dataset = dataset; }
}
