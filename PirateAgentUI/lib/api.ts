import type {
  Workflow,
  WorkflowStatus,
  StageState,
  StageKey,
  Dataset,
  DatasetRow,
  DataField,
  SourceRecord,
} from "./types";
import { MOCK_WORKFLOWS, MOCK_DATASETS } from "./mock-data";

export interface BackendFieldDefinition {
  name: string;
  label: string;
  type: string;
  description: string;
  required: boolean;
}

export interface BackendWorkflowPlan {
  intentSummary: string;
  targetEntityType: string;
  searchQueries: string[];
  permittedDomains: string[];
  schema: BackendFieldDefinition[];
  dedupKeys: string[];
  reasoning?: string;
}

export interface BackendTaskLog {
  id: number;
  timestamp: string;
  step: string;
  message: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
}

export interface BackendTask {
  id: string;
  userPrompt: string;
  status: "PENDING" | "PLANNING" | "SEARCHING" | "EXTRACTING" | "DEDUPLICATING" | "COMPLETED" | "FAILED";
  progress: number;
  currentStep: string;
  permittedSources: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  workflowPlan?: BackendWorkflowPlan;
  logs: BackendTaskLog[];
  datasetId?: string;
  totalRecords?: number;
}

export interface BackendSourceCitation {
  id: number;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  recordsExtracted: number;
}

export interface BackendDataset {
  id: string;
  taskId: string;
  title: string;
  description: string;
  schema: BackendFieldDefinition[];
  totalRecords: number;
  duplicateCount: number;
  averageConfidence: number;
  createdAt: string;
  records: Array<Record<string, any>>;
  sources: BackendSourceCitation[];
}

export interface BackendTemplate {
  title: string;
  category: string;
  prompt: string;
  permittedSources: string;
}

const API_BASE = "/api";

export function mapBackendStatus(status: BackendTask["status"]): WorkflowStatus {
  switch (status) {
    case "PENDING":
    case "PLANNING":
      return "planning";
    case "SEARCHING":
    case "EXTRACTING":
    case "DEDUPLICATING":
      return "running";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    default:
      return "running";
  }
}

export function computeStages(status: BackendTask["status"]): StageState[] {
  const isPlanning = status === "PLANNING" || status === "PENDING";
  const isSearching = status === "SEARCHING";
  const isExtracting = status === "EXTRACTING";
  const isDeduplicating = status === "DEDUPLICATING";
  const isCompleted = status === "COMPLETED";

  const getStatus = (
    activeCond: boolean,
    doneCond: boolean
  ): "pending" | "active" | "done" | "error" => {
    if (status === "FAILED") return "error";
    if (doneCond) return "done";
    if (activeCond) return "active";
    return "pending";
  };

  return [
    {
      key: "understand",
      label: "AI Mission Analysis",
      status: getStatus(isPlanning, !isPlanning),
    },
    {
      key: "discover",
      label: "Query & Domain Strategy",
      status: getStatus(
        isSearching,
        isExtracting || isDeduplicating || isCompleted
      ),
    },
    {
      key: "collect",
      label: "Tavily Web Ingestion",
      status: getStatus(
        isSearching,
        isExtracting || isDeduplicating || isCompleted
      ),
    },
    {
      key: "extract",
      label: "Gemini Structured Reasoning",
      status: getStatus(isExtracting, isDeduplicating || isCompleted),
    },
    {
      key: "validate",
      label: "Schema Compliance",
      status: getStatus(isDeduplicating, isCompleted),
    },
    {
      key: "dedupe",
      label: "Entity Deduplication",
      status: getStatus(isDeduplicating, isCompleted),
    },
    {
      key: "build",
      label: "Intelligence Delivery",
      status: getStatus(isCompleted, isCompleted),
    },
  ];
}

export function taskToWorkflow(task: BackendTask): Workflow {
  const fields: DataField[] =
    task.workflowPlan?.schema?.map((f) => ({
      name: f.name,
      type:
        f.type === "number"
          ? "number"
          : f.name.toLowerCase().includes("email")
          ? "email"
          : f.name.toLowerCase().includes("url") || f.name.toLowerCase().includes("website")
          ? "url"
          : "text",
      required: f.required ?? true,
    })) || [
      { name: "title", type: "text", required: true },
      { name: "description", type: "text", required: true },
    ];

  return {
    id: task.id,
    name:
      task.workflowPlan?.targetEntityType ||
      task.userPrompt.slice(0, 48) + (task.userPrompt.length > 48 ? "…" : ""),
    prompt: task.userPrompt,
    status: mapBackendStatus(task.status),
    progress: task.progress,
    createdAt: task.createdAt,
    updatedAt: task.completedAt || task.createdAt,
    recordsFound: task.totalRecords || 0,
    validRecords: task.totalRecords || 0,
    duplicates: 0,
    sourcesProcessed: task.workflowPlan?.permittedDomains?.length || 4,
    sourcesTotal: task.workflowPlan?.permittedDomains?.length || 4,
    stages: computeStages(task.status),
    datasetId: task.datasetId,
    contract: {
      entity: task.workflowPlan?.targetEntityType || "Web Records",
      fields,
      filters: task.workflowPlan?.dedupKeys || ["primaryKey"],
      sourceTypes: task.workflowPlan?.permittedDomains || ["Authorized Domains"],
      targetCount: task.totalRecords || 50,
    },
  };
}

export function backendDatasetToUi(
  bd: BackendDataset,
  task?: BackendTask
): Dataset {
  const fields: DataField[] = bd.schema.map((f) => ({
    name: f.name,
    type:
      f.type === "number"
        ? "number"
        : f.name.toLowerCase().includes("email")
        ? "email"
        : f.name.toLowerCase().includes("url") || f.name.toLowerCase().includes("website")
        ? "url"
        : "text",
    required: f.required,
  }));

  const rows: DatasetRow[] = (bd.records || []).map((rec, i) => {
    const sourceIds = bd.sources?.length
      ? [String(bd.sources[i % bd.sources.length].id)]
      : [];
    return {
      id: `rec-${i}`,
      data: rec,
      sourceIds,
      confidence: Math.round((bd.averageConfidence || 0.9) * 100),
      isValid: true,
      collectedAt: bd.createdAt,
    };
  });

  return {
    id: bd.taskId || bd.id,
    workflowId: bd.taskId,
    name: bd.title || (task ? task.userPrompt : "Extracted Dataset"),
    description: bd.description || `Structured dataset extracted via Gemini AI & Tavily intelligence search.`,
    recordCount: bd.totalRecords || rows.length,
    sourceCount: bd.sources?.length || 0,
    status: "ready",
    createdAt: bd.createdAt,
    updatedAt: bd.createdAt,
    fields,
    rows,
  };
}

export const api = {
  async createTask(prompt: string, permittedSources = "ALL"): Promise<BackendTask> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, permittedSources }),
    });
    if (!res.ok) throw new Error(`Failed to create research task: ${res.statusText}`);
    return res.json();
  },

  async getTasks(): Promise<BackendTask[]> {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async getTask(id: string): Promise<BackendTask | null> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getDataset(taskId: string): Promise<BackendDataset | null> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/dataset`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async rerunTask(id: string): Promise<BackendTask> {
    const res = await fetch(`${API_BASE}/tasks/${id}/rerun`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to rerun task: ${res.statusText}`);
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);
  },

  async getTemplates(): Promise<BackendTemplate[]> {
    try {
      const res = await fetch(`${API_BASE}/templates`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  getExportUrl(taskId: string, format: "csv" | "json"): string {
    return `${API_BASE}/tasks/${taskId}/export?format=${format}`;
  },
};
