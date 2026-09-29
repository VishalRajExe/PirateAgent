"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { HistoryScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { api, taskToWorkflow } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Workflow } from "@/lib/types";

const PAGE_SIZE = 5;

function formatDuration(sec?: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          const liveWorkflows = tasks.map(taskToWorkflow);
          setWorkflows(liveWorkflows);
        } else {
          setWorkflows([]);
        }
      } catch (err) {
        console.warn("Could not load backend tasks for history", err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const past = workflows.filter((w) => w.status !== "running" && w.status !== "planning");
  const totalPages = Math.ceil(past.length / PAGE_SIZE) || 1;
  const pagedPast = past.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleRerun(workflow: Workflow) {
    setRerunningId(workflow.id);
    try {
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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expedition?")) return;
    setDeletingId(id);
    try {
      if (id.includes("-")) {
        await api.deleteTask(id);
      }
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      if (pagedPast.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.warn("Could not delete task from backend", err);
      // Still remove from UI
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
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
        <div className="space-y-3">
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
                  <th className="px-3.5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pagedPast.map((w) => (
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
                          className="h-7 w-7 bg-card border-border/80 hover:bg-surface text-muted-foreground hover:text-foreground"
                          title="View details"
                          onClick={() => router.push(`/dashboard/workflows/${w.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card border-border/80 hover:bg-surface text-muted-foreground hover:text-foreground"
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
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-card border-border/80 hover:border-danger/40 hover:bg-danger-soft/20 text-muted-foreground hover:text-danger transition-colors"
                          title="Delete expedition"
                          disabled={deletingId === w.id}
                          onClick={() => handleDelete(w.id)}
                        >
                          {deletingId === w.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-danger" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={past.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemName="expeditions"
          />
        </div>
      )}
    </div>
  );
}
