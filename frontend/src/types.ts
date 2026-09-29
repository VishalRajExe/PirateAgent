export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  description: string;
  required: boolean;
}

export interface WorkflowPlan {
  intentSummary: string;
  targetEntityType: string;
  searchQueries: string[];
  permittedDomains: string[];
  schema: FieldDefinition[];
  dedupKeys: string[];
  reasoning?: string;
}

export interface TaskLog {
  id: number;
  timestamp: string;
  step: string;
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
}

export interface Task {
  id: string;
  userPrompt: string;
  status: 'PENDING' | 'PLANNING' | 'SEARCHING' | 'EXTRACTING' | 'DEDUPLICATING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  permittedSources: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  workflowPlan?: WorkflowPlan;
  logs: TaskLog[];
  datasetId?: string;
  totalRecords?: number;
}

export interface SourceCitation {
  id: number;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  recordsExtracted: number;
}

export interface Dataset {
  id: string;
  taskId: string;
  title: string;
  description: string;
  schema: FieldDefinition[];
  totalRecords: number;
  duplicateCount: number;
  averageConfidence: number;
  createdAt: string;
  records: Array<Record<string, any>>;
  sources: SourceCitation[];
}

export interface Template {
  title: string;
  category: string;
  prompt: string;
  permittedSources: string;
}
