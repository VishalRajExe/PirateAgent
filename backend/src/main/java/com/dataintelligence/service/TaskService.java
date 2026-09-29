package com.dataintelligence.service;

import com.dataintelligence.dto.*;
import com.dataintelligence.exception.ResourceNotFoundException;
import com.dataintelligence.model.*;
import com.dataintelligence.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final DatasetRepository datasetRepository;
    private final DatasetRecordRepository recordRepository;
    private final SourceCitationRepository citationRepository;
    private final TaskLogRepository logRepository;
    private final WorkflowEngine workflowEngine;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TaskService(
            TaskRepository taskRepository,
            DatasetRepository datasetRepository,
            DatasetRecordRepository recordRepository,
            SourceCitationRepository citationRepository,
            TaskLogRepository logRepository,
            WorkflowEngine workflowEngine
    ) {
        this.taskRepository = taskRepository;
        this.datasetRepository = datasetRepository;
        this.recordRepository = recordRepository;
        this.citationRepository = citationRepository;
        this.logRepository = logRepository;
        this.workflowEngine = workflowEngine;
    }

    public String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return auth.getName();
        }
        return "captain";
    }

    public TaskDetailResponse createTask(TaskCreateRequest request) {
        IntelligenceTask task = new IntelligenceTask();
        task.setId(UUID.randomUUID().toString());
        task.setUserPrompt(request.getPrompt());
        task.setPermittedSources(request.getPermittedSources() != null && !request.getPermittedSources().isBlank()
                ? request.getPermittedSources()
                : "ALL");

        String resolvedUser = (request.getUserId() != null && !request.getUserId().isBlank())
                ? request.getUserId().trim()
                : getCurrentUser();
        task.setUserId(resolvedUser);

        task.setStatus("PENDING");
        task.setProgress(0);
        task.setCurrentStep("Queued for dynamic planning");
        task.setCreatedAt(LocalDateTime.now());

        task = taskRepository.saveAndFlush(task);

        // Execute workflow asynchronously in background
        workflowEngine.executeWorkflowAsync(task.getId());

        return mapToDetailResponse(task);
    }

    public List<TaskDetailResponse> getAllTasks() {
        String user = getCurrentUser();
        List<IntelligenceTask> tasks = "admin".equalsIgnoreCase(user)
                ? taskRepository.findAllByOrderByCreatedAtDesc()
                : taskRepository.findByUserIdOrderByCreatedAtDesc(user);
        if (tasks.isEmpty() && !"admin".equalsIgnoreCase(user)) {
            tasks = taskRepository.findAllByOrderByCreatedAtDesc();
        }
        return tasks.stream()
                .map(this::mapToDetailResponse)
                .toList();
    }

    public Page<TaskDetailResponse> getTasksPaginated(int page, int size, String status, String query) {
        String user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        String normStatus = (status == null || status.isBlank()) ? null : status.toUpperCase();
        String normQuery = (query == null || query.isBlank()) ? null : query;

        Page<IntelligenceTask> paged = "admin".equalsIgnoreCase(user)
                ? taskRepository.findFiltered(normStatus, normQuery, pageable)
                : taskRepository.findFilteredWithUser(user, normStatus, normQuery, pageable);

        if (paged.isEmpty() && !"admin".equalsIgnoreCase(user)) {
            paged = taskRepository.findFiltered(normStatus, normQuery, pageable);
        }
        return paged.map(this::mapToDetailResponse);
    }

    public Optional<TaskDetailResponse> getTaskById(String id) {
        return taskRepository.findById(id).map(this::mapToDetailResponse);
    }

    @Transactional(readOnly = true)
    public Optional<DatasetDetailResponse> getDatasetByTaskId(String taskId) {
        Optional<Dataset> datasetOpt = datasetRepository.findByTaskId(taskId);
        if (datasetOpt.isEmpty()) {
            return Optional.empty();
        }

        Dataset dataset = datasetOpt.get();
        DatasetDetailResponse response = new DatasetDetailResponse();
        response.setId(dataset.getId());
        response.setTaskId(taskId);
        response.setTitle(dataset.getTitle());
        response.setDescription(dataset.getDescription());
        response.setTotalRecords(dataset.getTotalRecords());
        response.setDuplicateCount(dataset.getDuplicateCount());
        response.setAverageConfidence(dataset.getAverageConfidence());
        response.setCreatedAt(dataset.getCreatedAt());

        // Parse Schema
        try {
            if (dataset.getSchemaJson() != null) {
                List<FieldDefinitionDto> schema = objectMapper.readValue(dataset.getSchemaJson(), new TypeReference<List<FieldDefinitionDto>>() {});
                response.setSchema(schema);
            }
        } catch (Exception ignored) {}

        // Parse Records
        List<DatasetRecord> records = recordRepository.findByDatasetId(dataset.getId());
        List<Map<String, Object>> parsedRecords = new ArrayList<>();
        for (DatasetRecord rec : records) {
            try {
                Map<String, Object> map = objectMapper.readValue(rec.getDataJson(), new TypeReference<Map<String, Object>>() {});
                map.put("_record_id", rec.getId());
                map.put("_confidence_score", rec.getConfidenceScore());
                map.put("_source_url", rec.getSourceUrl());
                map.put("_source_title", rec.getSourceTitle());
                map.put("_citation_snippet", rec.getCitationSnippet());
                parsedRecords.add(map);
            } catch (Exception ignored) {}
        }
        response.setRecords(parsedRecords);

        // Sources
        List<SourceCitation> citations = citationRepository.findByDatasetId(dataset.getId());
        response.setSources(citations);

        return Optional.of(response);
    }

    public TaskDetailResponse rerunTask(String id) {
        IntelligenceTask oldTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        TaskCreateRequest request = new TaskCreateRequest(oldTask.getUserPrompt(), oldTask.getPermittedSources());
        return createTask(request);
    }

    public boolean deleteTask(String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private TaskDetailResponse mapToDetailResponse(IntelligenceTask task) {
        TaskDetailResponse resp = new TaskDetailResponse();
        resp.setId(task.getId());
        resp.setUserId(task.getUserId());
        resp.setUserPrompt(task.getUserPrompt());
        resp.setStatus(task.getStatus());
        resp.setProgress(task.getProgress());
        resp.setCurrentStep(task.getCurrentStep());
        resp.setPermittedSources(task.getPermittedSources());
        resp.setCreatedAt(task.getCreatedAt());
        resp.setCompletedAt(task.getCompletedAt());
        resp.setErrorMessage(task.getErrorMessage());

        // Load logs
        resp.setLogs(logRepository.findByTaskIdOrderByTimestampAsc(task.getId()));

        // Workflow Plan
        if (task.getWorkflowPlanJson() != null) {
            try {
                resp.setWorkflowPlan(objectMapper.readValue(task.getWorkflowPlanJson(), WorkflowPlanDto.class));
            } catch (Exception ignored) {}
        }

        // Dataset ID & Count if completed
        datasetRepository.findByTaskId(task.getId()).ifPresent(ds -> {
            resp.setDatasetId(ds.getId());
            resp.setTotalRecords(ds.getTotalRecords());
        });

        return resp;
    }
}
