package com.dataintelligence.controller;

import com.dataintelligence.dto.DatasetDetailResponse;
import com.dataintelligence.dto.TaskCreateRequest;
import com.dataintelligence.dto.TaskDetailResponse;
import com.dataintelligence.service.ExportService;
import com.dataintelligence.service.TaskService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DataIntelligenceController {

    private final TaskService taskService;
    private final ExportService exportService;

    public DataIntelligenceController(TaskService taskService, ExportService exportService) {
        this.taskService = taskService;
        this.exportService = exportService;
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDetailResponse> createTask(@RequestBody TaskCreateRequest request) {
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TaskDetailResponse task = taskService.createTask(request);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDetailResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskDetailResponse> getTaskById(@PathVariable String id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tasks/{id}/dataset")
    public ResponseEntity<DatasetDetailResponse> getDatasetByTaskId(@PathVariable String id) {
        return taskService.getDatasetByTaskId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tasks/{id}/rerun")
    public ResponseEntity<TaskDetailResponse> rerunTask(@PathVariable String id) {
        return ResponseEntity.ok(taskService.rerunTask(id));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        boolean deleted = taskService.deleteTask(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/tasks/{id}/export")
    public ResponseEntity<byte[]> exportDataset(
            @PathVariable String id,
            @RequestParam(defaultValue = "csv") String format
    ) {
        if ("json".equalsIgnoreCase(format)) {
            String json = exportService.exportToJson(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dataset-" + id + ".json\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json.getBytes());
        } else {
            String csv = exportService.exportToCsv(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dataset-" + id + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .body(csv.getBytes());
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, String>>> getPresetTemplates() {
        List<Map<String, String>> templates = List.of(
                Map.of(
                        "title", "AI / ML Engineering Job Openings",
                        "category", "Hiring & Talent",
                        "prompt", "Find current remote Senior AI Engineer and Machine Learning Researcher job openings in the US with company names, salary ranges, required tech stack, and application URLs.",
                        "permittedSources", "greenhouse.io, lever.co, workable.com, linkedin.com"
                ),
                Map.of(
                        "title", "B2B SaaS FinTech Sales Leads",
                        "category", "Sales & Prospecting",
                        "prompt", "Collect verified sales leads for Series A to C FinTech companies in North America including Company Name, CEO/Founders, Headquarters, Estimated Revenue, and Recent Funding details.",
                        "permittedSources", "crunchbase.com, linkedin.com, techcrunch.com"
                ),
                Map.of(
                        "title", "European CleanTech Venture Capital Funds",
                        "category", "Investment Intelligence",
                        "prompt", "Extract top 10 venture capital funds actively investing in European climate tech and clean energy startups, including fund name, managing partners, typical ticket size, and recent portfolio investments.",
                        "permittedSources", "crunchbase.com, pitchbook.com, sifted.eu"
                ),
                Map.of(
                        "title", "Top 5 LLM Training Chip & Hardware Providers",
                        "category", "Market Research",
                        "prompt", "Research the top 5 semiconductor and cloud hardware providers for training frontier LLMs with company name, flagship chip architecture, estimated market share, and key customers.",
                        "permittedSources", "ALL"
                ),
                Map.of(
                        "title", "Tech Conference & Hackathon Sponsors",
                        "category", "Sponsorship & Partnerships",
                        "prompt", "Find major enterprise tech companies actively sponsoring developer hackathons and AI summits in 2026, including sponsor company, tier, key developer contact, and developer relations initiative.",
                        "permittedSources", "devpost.com, github.com, eventbrite.com"
                )
        );
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Data Intelligence Platform",
                "version", "1.0.0",
                "backend", "Spring Boot 3.3.4 (Java 21)"
        ));
    }
}
