package com.dataintelligence.dto;

public class TaskCreateRequest {
    private String prompt;
    private String permittedSources;
    private String userId;

    public TaskCreateRequest() {}

    public TaskCreateRequest(String prompt, String permittedSources) {
        this.prompt = prompt;
        this.permittedSources = permittedSources;
    }

    public TaskCreateRequest(String prompt, String permittedSources, String userId) {
        this.prompt = prompt;
        this.permittedSources = permittedSources;
        this.userId = userId;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getPermittedSources() { return permittedSources; }
    public void setPermittedSources(String permittedSources) { this.permittedSources = permittedSources; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
