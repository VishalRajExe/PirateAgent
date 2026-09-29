"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getWorkflow, MOCK_ACTIVITY } from "@/lib/mock-data";
import { WorkflowRunView } from "@/components/workflow/workflow-run-view";
import { api, taskToWorkflow } from "@/lib/api";
import type { Workflow } from "@/lib/types";

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(() => getWorkflow(params.id) || null);
  const [logs, setLogs] = useState<{ id: string; text: string; timestamp: string }[]>(() => {
    return MOCK_ACTIVITY.filter((a) => a.workflowId === params.id).map((a) => ({
      id: a.id,
      text: a.text,
      timestamp: a.timestamp,
    }));
  });
  const [loading, setLoading] = useState(!workflow);

  useEffect(() => {
    if (workflow) return;

    async function loadTask() {
      try {
        const task = await api.getTask(params.id);
        if (task) {
          const wf = taskToWorkflow(task);
          setWorkflow(wf);
          const taskLogs = (task.logs || []).map((l) => ({
            id: String(l.id),
            text: `[${l.step}] ${l.message}`,
            timestamp: l.timestamp,
          }));
          setLogs(
            taskLogs.length
              ? taskLogs
              : [{ id: "l0", text: "Workflow created", timestamp: task.createdAt }]
          );
        }
      } catch (err) {
        console.warn("Could not fetch task", params.id, err);
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [params.id, workflow]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    notFound();
  }

  return (
    <WorkflowRunView
      name={workflow.name}
      prompt={workflow.prompt}
      status={workflow.status}
      progress={workflow.progress}
      stages={workflow.stages}
      recordsFound={workflow.recordsFound}
      validRecords={workflow.validRecords}
      duplicates={workflow.duplicates}
      sourcesProcessed={workflow.sourcesProcessed}
      sourcesTotal={workflow.sourcesTotal}
      log={logs.length ? logs : [{ id: "l0", text: "Workflow initialized", timestamp: workflow.createdAt }]}
      datasetId={workflow.datasetId || workflow.id}
    />
  );
}
