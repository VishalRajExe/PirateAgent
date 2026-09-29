"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { TreasureMapIcon, SpyglassIcon, SailingShipIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/common/pagination";
import { api, taskToWorkflow } from "@/lib/api";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import type { Workflow, WorkflowStatus } from "@/lib/types";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 6;

const FILTERS: { key: "all" | WorkflowStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | WorkflowStatus>("all");
  const [query, setQuery] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadServerTasks() {
      setLoading(true);
      try {
        const pageResult = await api.getTasksPage({
          page: page - 1,
          size: PAGE_SIZE,
          status: filter === "all" ? undefined : filter.toUpperCase(),
          q: query.trim() || undefined,
        });

        if (!cancelled) {
          const mapped = pageResult.content.map(taskToWorkflow);
          setWorkflows(mapped);
          setTotalPages(Math.max(1, pageResult.totalPages));
          setTotalElements(pageResult.totalElements);
        }
      } catch (err) {
        console.warn("Could not load backend tasks:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServerTasks();
    return () => {
      cancelled = true;
    };
  }, [page, filter, query]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await api.deleteTask(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      if (workflows.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.warn("Could not delete task", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-tan mb-1">
            <TreasureMapIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              NAVIGATION LOG
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Workflows
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Research missions you&apos;ve initiated and their operational status.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => router.push("/dashboard/research/new")}
          className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> New research
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(v as typeof filter);
            setPage(1);
          }}
        >
          <TabsList className="bg-surface border-border">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key} className="text-xs font-semibold">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-[240px]">
          <SpyglassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search workflows…"
            className="h-8 pl-8 text-[13px] bg-card border-border/80"
          />
        </div>
      </div>

      {loading && workflows.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={SailingShipIcon}
          title="No voyages found"
          description={
            query || filter !== "all"
              ? "No workflows match your search or filter criteria."
              : "No workflows initiated yet. Click 'New research' above to start your first mission."
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {workflows.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={
                    w.status === "running" || w.status === "planning"
                      ? `/dashboard/workflows/live?taskId=${w.id}`
                      : `/dashboard/workflows/${w.id}`
                  }
                >
                  <Card className="h-full border-border bg-card transition-all hover:border-tan/60 hover:shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-semibold leading-snug text-foreground">
                          {w.name}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={w.status} />
                          <button
                            type="button"
                            title="Delete workflow"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(w.id);
                            }}
                            className="p-1 rounded-md text-muted-foreground/70 hover:text-danger hover:bg-danger-soft/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] text-muted-foreground leading-relaxed">
                        {w.prompt}
                      </p>
                      <div className="mt-3.5">
                        <Progress value={w.progress} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
                        <span>{formatNumber(w.validRecords)} valid records</span>
                        <span>{formatRelativeTime(w.updatedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemName="workflows"
          />
        </div>
      )}
    </div>
  );
}
