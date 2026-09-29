"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Loader2 } from "lucide-react";
import { HistoryScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { MOCK_WORKFLOWS } from "@/lib/mock-data";
import { api, taskToWorkflow } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Workflow } from "@/lib/types";

function formatDuration(sec?: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [rerunningId, setRerunningId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          const liveWorkflows = tasks.map(taskToWorkflow);
          const combined = [
            ...liveWorkflows,
            ...MOCK_WORKFLOWS.filter((mw) => !liveWorkflows.some((lw) => lw.id === mw.id)),
          ];
          setWorkflows(combined);
        }
      } catch (err) {
        console.warn("Could not load backend tasks for history", err);
      }
    }
    loadTasks();
  }, []);

  const past = workflows.filter((w) => w.status !== "running" && w.status !== "planning");

  async function handleRerun(workflow: Workflow) {
    setRerunningId(workflow.id);
    try {
      // Try to re-run on backend if it's a real task UUID
      if (workflow.id.includes("-")) {
        const rerunTask = await api.rerunTask(workflow.id);
        router.push(`/dashboard/workflows/live?taskId=${rerunTask.id}`);
        return;
      }
    } catch (err) {
      console.warn("Could not rerun task directly, redirecting to research prompt", err);
    } finally {
      setRerunningId(null);
    }
    router.push(`/dashboard/research/new?prompt=${encodeURIComponent(workflow.prompt)}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-tan mb-1">
          <HistoryScrollIcon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            EXPEDITION ARCHIVE
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          History
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Historical log of completed voyages, datasets generated, and execution times.
        </p>
      </div>

      {past.length === 0 ? (
        <EmptyState
          icon={HistoryScrollIcon}
          title="No history yet"
          description="Completed and archived research voyages will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface/90 border-b border-border">
              <tr>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Workflow</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Records</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Sources</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-3.5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {past.map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-surface/60">
                  <td className="px-3.5 py-3">
                    <p className="max-w-[240px] truncate font-semibold text-foreground">{w.name}</p>
                    <p className="max-w-[240px] truncate text-[12px] text-muted-foreground">{w.prompt}</p>
                  </td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-3.5 py-3 font-medium text-foreground">{formatNumber(w.validRecords)}</td>
                  <td className="px-3.5 py-3 text-muted-foreground">{w.sourcesProcessed}</td>
                  <td className="px-3.5 py-3 text-muted-foreground">{formatDuration(w.durationSec)}</td>
                  <td className="px-3.5 py-3 text-muted-foreground">{formatDate(w.createdAt)}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-card border-border/80"
                        title="View details"
                        onClick={() => router.push(`/dashboard/workflows/${w.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-card border-border/80"
                        title="Re-run mission"
                        disabled={rerunningId === w.id}
                        onClick={() => handleRerun(w)}
                      >
                        {rerunningId === w.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
