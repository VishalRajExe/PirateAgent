package com.dataintelligence.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FieldDefinitionDto {
    private String name;
    private String label;
    private String type;
    private String description;
    private boolean required;

    public FieldDefinitionDto() {}

    public FieldDefinitionDto(String name, String label, String type, String description, boolean required) {
        this.name = name;
        this.label = label;
        this.type = type;
        this.description = description;
        this.required = required;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
}
