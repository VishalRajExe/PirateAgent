package com.dataintelligence.dto;

import com.dataintelligence.model.TaskLog;
import java.time.LocalDateTime;
import java.util.List;

public class TaskDetailResponse {
    private String id;
    private String userPrompt;
    private String status;
    private int progress;
    private String currentStep;
    private String permittedSources;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String errorMessage;
    private WorkflowPlanDto workflowPlan;
    private List<TaskLog> logs;
    private String datasetId;
    private Integer totalRecords;
    private String userId;

    public TaskDetailResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public WorkflowPlanDto getWorkflowPlan() { return workflowPlan; }
    public void setWorkflowPlan(WorkflowPlanDto workflowPlan) { this.workflowPlan = workflowPlan; }

    public List<TaskLog> getLogs() { return logs; }
    public void setLogs(List<TaskLog> logs) { this.logs = logs; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public Integer getTotalRecords() { return totalRecords; }
    public void setTotalRecords(Integer totalRecords) { this.totalRecords = totalRecords; }
}
