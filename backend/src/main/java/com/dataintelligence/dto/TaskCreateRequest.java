package com.dataintelligence.dto;

public class TaskCreateRequest {
    private String prompt;
    private String permittedSources;

    public TaskCreateRequest() {}

    public TaskCreateRequest(String prompt, String permittedSources) {
        this.prompt = prompt;
        this.permittedSources = permittedSources;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getPermittedSources() { return permittedSources; }
    public void setPermittedSources(String permittedSources) { this.permittedSources = permittedSources; }
}
