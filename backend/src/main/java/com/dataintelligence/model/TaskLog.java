package com.dataintelligence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_logs")
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private IntelligenceTask task;

    private LocalDateTime timestamp;
    private String step;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String level; // INFO, SUCCESS, WARN, ERROR

    public TaskLog() {}

    public TaskLog(IntelligenceTask task, String step, String message, String level) {
        this.task = task;
        this.step = step;
        this.message = message;
        this.level = level;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IntelligenceTask getTask() { return task; }
    public void setTask(IntelligenceTask task) { this.task = task; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
