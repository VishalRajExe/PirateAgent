package com.dataintelligence.service;

import com.dataintelligence.dto.TavilySearchResult;
import com.dataintelligence.dto.WorkflowPlanDto;
import com.dataintelligence.model.*;
import com.dataintelligence.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WorkflowEngine {

    private static final Logger log = LoggerFactory.getLogger(WorkflowEngine.class);

    private final TaskRepository taskRepository;
    private final DatasetRepository datasetRepository;
    private final DatasetRecordRepository recordRepository;
    private final SourceCitationRepository citationRepository;
    private final TaskLogRepository logRepository;
    private final GeminiService geminiService;
    private final TavilyService tavilyService;
    private final DataQualityService dataQualityService;
    private final LangGraphService langGraphService;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public WorkflowEngine(
            TaskRepository taskRepository,
            DatasetRepository datasetRepository,
            DatasetRecordRepository recordRepository,
            SourceCitationRepository citationRepository,
            TaskLogRepository logRepository,
            GeminiService geminiService,
            TavilyService tavilyService,
            DataQualityService dataQualityService,
            LangGraphService langGraphService
    ) {
        this.taskRepository = taskRepository;
        this.datasetRepository = datasetRepository;
        this.recordRepository = recordRepository;
        this.citationRepository = citationRepository;
        this.logRepository = logRepository;
        this.geminiService = geminiService;
        this.tavilyService = tavilyService;
        this.dataQualityService = dataQualityService;
        this.langGraphService = langGraphService;
    }

    public void executeWorkflowAsync(String taskId) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                executeWorkflowSync(taskId);
            } catch (Exception e) {
                log.error("Fatal error executing workflow for task: {}", taskId, e);
            }
        });
    }

    public void executeWorkflowSync(String taskId) {
        log.info("Starting workflow execution for taskId: {}", taskId);
        Optional<IntelligenceTask> optionalTask = taskRepository.findById(taskId);
        for (int i = 0; i < 5 && optionalTask.isEmpty(); i++) {
            try { Thread.sleep(250); } catch (Exception ignored) {}
            optionalTask = taskRepository.findById(taskId);
        }

        if (optionalTask.isEmpty()) {
            log.error("Task not found for execution: {}", taskId);
            return;
        }

        IntelligenceTask task = optionalTask.get();

        try {
            // ==========================================
            // STAGE 1: INTENT UNDERSTANDING & WORKFLOW DESIGN
            // ==========================================
            task.setStatus("PLANNING");
            task.setProgress(10);
            task.setCurrentStep("Analyzing business requirement & synthesizing execution schema");
            saveLog(task, "Planning", "Analyzing natural language prompt with Gemini AI...", "INFO");
            task = taskRepository.saveAndFlush(task);

            List<String> userPermitted = parsePermittedSources(task.getPermittedSources());
            WorkflowPlanDto plan = geminiService.synthesizeWorkflowPlan(task.getUserPrompt(), task.getPermittedSources());
            task.setWorkflowPlanJson(objectMapper.writeValueAsString(plan));

            saveLog(task, "Planning", "Dynamic schema generated: " + plan.getSchema().size() + " fields, "
                    + plan.getSearchQueries().size() + " strategic search queries.", "SUCCESS");

            // ==========================================
            // STAGE 2: PERMITTED SOURCE RETRIEVAL
            // ==========================================
            task.setStatus("SEARCHING");
            task.setProgress(35);
            task.setCurrentStep("Gathering intelligence from permitted web sources");
            saveLog(task, "Searching", "Initiating web research via Tavily across permitted sources...", "INFO");
            task = taskRepository.saveAndFlush(task);

            List<TavilySearchResult> allSearchResults = new ArrayList<>();
            List<String> targetQueries = plan.getSearchQueries().isEmpty()
                    ? List.of(task.getUserPrompt())
                    : plan.getSearchQueries();

            for (String query : targetQueries) {
                saveLog(task, "Searching", "Executing search query: \"" + query + "\"...", "INFO");
                List<TavilySearchResult> results = tavilyService.search(query, plan.getPermittedDomains(), 5);
                allSearchResults.addAll(results);
            }

            saveLog(task, "Searching", "Retrieved " + allSearchResults.size() + " raw source pages from authorized domains.", "SUCCESS");

            // ==========================================
            // STAGE 3: DATA EXTRACTION & ATTRIBUTION
            // ==========================================
            task.setStatus("EXTRACTING");
            task.setProgress(65);
            task.setCurrentStep("Extracting and structuring records with source citations");
            saveLog(task, "Extraction", "Processing source documents through Gemini for structured reasoning & extraction...", "INFO");
            task = taskRepository.saveAndFlush(task);

            List<Map<String, Object>> extractedRecords = geminiService.extractStructuredRecords(task.getUserPrompt(), plan, allSearchResults);
            saveLog(task, "Extraction", "Extracted " + extractedRecords.size() + " candidate records with source attribution.", "SUCCESS");

            // Optional LangGraph multi-agent enrichment pass
            try {
                saveLog(task, "Enrichment", "Calling LangGraph multi-agent enrichment engine (:2024)...", "INFO");
                List<Map<String, Object>> schemaFields = new ArrayList<>();
                if (plan.getSchema() != null) {
                    for (var f : plan.getSchema()) {
                        Map<String, Object> fm = new HashMap<>();
                        fm.put("name", f.getName());
                        fm.put("type", f.getType());
                        fm.put("required", f.isRequired());
                        fm.put("description", f.getDescription() != null ? f.getDescription() : f.getName());
                        schemaFields.add(fm);
                    }
                }
                Map<String, Object> jsonSchema = langGraphService.buildExtractionSchema(
                        plan.getTargetEntityType() != null ? plan.getTargetEntityType() : "Entity",
                        schemaFields
                );
                Map<String, Object> langGraphInfo = langGraphService.runEnrichmentAgent(task.getUserPrompt(), jsonSchema);
                if (langGraphInfo != null && !langGraphInfo.isEmpty()) {
                    saveLog(task, "Enrichment", "LangGraph multi-agent graph synthesized attributes: " + langGraphInfo.keySet(), "SUCCESS");
                    Map<String, Object> lgRecord = new LinkedHashMap<>(langGraphInfo);
                    lgRecord.putIfAbsent("_source_url", "http://127.0.0.1:2024/enrichment");
                    lgRecord.putIfAbsent("_source_title", "LangGraph Multi-Agent Engine");
                    lgRecord.putIfAbsent("_citation_snippet", "Autonomous multi-agent deep research graph synthesis");
                    lgRecord.putIfAbsent("_confidence_score", "0.98");
                    extractedRecords.add(lgRecord);
                } else {
                    saveLog(task, "Enrichment", "LangGraph multi-agent evaluation completed; continuing with primary dataset records.", "INFO");
                }
            } catch (Exception lgEx) {
                log.warn("LangGraph enrichment call exception: {}", lgEx.getMessage());
                saveLog(task, "Enrichment", "LangGraph pass skipped (agent offline or non-blocking): " + lgEx.getMessage(), "INFO");
            }

            // ==========================================
            // STAGE 4: CLEANING, DEDUPLICATION & VALIDATION
            // ==========================================
            task.setStatus("DEDUPLICATING");
            task.setProgress(85);
            task.setCurrentStep("Validating data quality, removing duplicates, and scoring confidence");
            saveLog(task, "Quality", "Running data quality pipeline: deduplication and schema validation...", "INFO");
            task = taskRepository.saveAndFlush(task);

            DataQualityService.QualityResult qualityResult = dataQualityService.processAndValidate(extractedRecords, plan);
            saveLog(task, "Quality", "Quality check finished. Kept " + qualityResult.cleanRecords().size()
                    + " unique records. Removed " + qualityResult.duplicatesRemoved() + " duplicates. Avg Confidence: "
                    + (qualityResult.averageConfidence() * 100) + "%.", "SUCCESS");

            // ==========================================
            // STAGE 5: DATASET CREATION & PERSISTENCE
            // ==========================================
            task.setCurrentStep("Finalizing dataset & citations");
            Dataset dataset = new Dataset();
            dataset.setId(UUID.randomUUID().toString());
            dataset.setTask(task);
            dataset.setTitle(plan.getTargetEntityType() != null ? plan.getTargetEntityType() : "Extracted Dataset");
            dataset.setDescription(plan.getIntentSummary());
            dataset.setSchemaJson(objectMapper.writeValueAsString(plan.getSchema()));
            dataset.setTotalRecords(qualityResult.cleanRecords().size());
            dataset.setDuplicateCount(qualityResult.duplicatesRemoved());
            dataset.setAverageConfidence(qualityResult.averageConfidence());
            datasetRepository.save(dataset);

            // Persist Records
            for (Map<String, Object> recordMap : qualityResult.cleanRecords()) {
                DatasetRecord record = new DatasetRecord();
                record.setDataJson(objectMapper.writeValueAsString(recordMap));
                record.setSourceUrl(recordMap.getOrDefault("_source_url", "").toString());
                record.setSourceTitle(recordMap.getOrDefault("_source_title", "").toString());
                record.setCitationSnippet(recordMap.getOrDefault("_citation_snippet", "").toString());

                double conf = 0.95;
                try {
                    conf = Double.parseDouble(recordMap.getOrDefault("_confidence_score", "0.95").toString());
                } catch (Exception ignored) {}
                record.setConfidenceScore(conf);
                record.setValid(true);
                dataset.addRecord(record);
                recordRepository.save(record);
            }

            // Persist Source Citations
            Map<String, SourceCitation> uniqueDomains = new HashMap<>();
            for (TavilySearchResult sr : allSearchResults) {
                String domain = extractDomain(sr.getUrl());
                if (!uniqueDomains.containsKey(sr.getUrl())) {
                    SourceCitation citation = new SourceCitation(dataset, sr.getUrl(), domain, sr.getTitle(), sr.getContent(), 1);
                    uniqueDomains.put(sr.getUrl(), citation);
                    dataset.addSource(citation);
                    citationRepository.save(citation);
                }
            }

            dataset = datasetRepository.saveAndFlush(dataset);

            task.setDataset(dataset);
            task.setStatus("COMPLETED");
            task.setProgress(100);
            task.setCurrentStep("Dataset ready");
            task.setCompletedAt(LocalDateTime.now());
            saveLog(task, "Complete", "Data intelligence workflow completed successfully! Dataset ready for exploration and export.", "SUCCESS");
            taskRepository.saveAndFlush(task);

        } catch (Exception e) {
            log.error("Workflow failed for task: {}", taskId, e);
            task.setStatus("FAILED");
            task.setErrorMessage(e.getMessage());
            task.setCurrentStep("Failed: " + e.getMessage());
            saveLog(task, "Error", "Workflow failed: " + e.getMessage(), "ERROR");
            taskRepository.saveAndFlush(task);
        }
    }

    private void saveLog(IntelligenceTask task, String step, String message, String level) {
        TaskLog log = new TaskLog(task, step, message, level);
        logRepository.save(log);
    }

    private List<String> parsePermittedSources(String permitted) {
        if (permitted == null || permitted.isBlank() || permitted.equalsIgnoreCase("ALL")) {
            return Collections.emptyList();
        }
        return Arrays.stream(permitted.split("[,;]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String domain = uri.getHost();
            return domain != null ? domain.startsWith("www.") ? domain.substring(4) : domain : url;
        } catch (Exception e) {
            return url;
        }
    }
}
