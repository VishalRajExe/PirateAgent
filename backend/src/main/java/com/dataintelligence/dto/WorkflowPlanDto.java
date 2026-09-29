package com.dataintelligence.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkflowPlanDto {
    private String intentSummary;
    private String targetEntityType;
    private List<String> searchQueries = new ArrayList<>();
    private List<String> permittedDomains = new ArrayList<>();
    private List<FieldDefinitionDto> schema = new ArrayList<>();
    private List<String> dedupKeys = new ArrayList<>();
    private String reasoning;

    public WorkflowPlanDto() {}

    public String getIntentSummary() { return intentSummary; }
    public void setIntentSummary(String intentSummary) { this.intentSummary = intentSummary; }

    public String getTargetEntityType() { return targetEntityType; }
    public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }

    public List<String> getSearchQueries() { return searchQueries; }
    public void setSearchQueries(List<String> searchQueries) { this.searchQueries = searchQueries; }

    public List<String> getPermittedDomains() { return permittedDomains; }
    public void setPermittedDomains(List<String> permittedDomains) { this.permittedDomains = permittedDomains; }

    public List<FieldDefinitionDto> getSchema() { return schema; }
    public void setSchema(List<FieldDefinitionDto> schema) { this.schema = schema; }

    public List<String> getDedupKeys() { return dedupKeys; }
    public void setDedupKeys(List<String> dedupKeys) { this.dedupKeys = dedupKeys; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
}
