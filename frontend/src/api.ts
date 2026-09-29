import { Task, Dataset, Template } from './types';

const API_BASE = '/api';

export const api = {
  async createTask(prompt: string, permittedSources?: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, permittedSources: permittedSources || 'ALL' }),
    });
    if (!res.ok) throw new Error(`Failed to create task: ${res.statusText}`);
    return res.json();
  },

  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    return res.json();
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch task: ${res.statusText}`);
    return res.json();
  },

  async getDataset(taskId: string): Promise<Dataset> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/dataset`);
    if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.statusText}`);
    return res.json();
  },

  async rerunTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}/rerun`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to rerun task: ${res.statusText}`);
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);
  },

  async getTemplates(): Promise<Template[]> {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error(`Failed to fetch templates: ${res.statusText}`);
    return res.json();
  },

  getExportUrl(taskId: string, format: 'csv' | 'json'): string {
    return `${API_BASE}/tasks/${taskId}/export?format=${format}`;
  },
};
