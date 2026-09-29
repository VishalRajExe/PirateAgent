"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { WorkflowRunView } from "@/components/workflow/workflow-run-view";
import { api, taskToWorkflow } from "@/lib/api";
import type { Workflow } from "@/lib/types";

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [logs, setLogs] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
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
        } else {
          setWorkflow(null);
        }
      } catch (err) {
        console.warn("Could not fetch task", params.id, err);
        setWorkflow(null);
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [params.id]);

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
