"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { ShipLogIcon, SpyglassIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { MOCK_DATASETS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";
import type { Dataset } from "@/lib/types";

const PAGE_SIZE = 6;

export default function DatasetsPage() {
  const [query, setQuery] = useState("");
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          const liveDatasets: Dataset[] = tasks
            .filter((t) => t.status === "COMPLETED")
            .map((t) => ({
              id: t.id,
              workflowId: t.id,
              name: t.workflowPlan?.targetEntityType || t.userPrompt.slice(0, 48),
              description: t.workflowPlan?.intentSummary || `Extracted dataset: ${t.userPrompt}`,
              recordCount: t.totalRecords || 0,
              sourceCount: t.workflowPlan?.permittedDomains?.length || 4,
              status: "ready",
              createdAt: t.completedAt || t.createdAt,
              updatedAt: t.completedAt || t.createdAt,
              fields:
                t.workflowPlan?.schema?.map((s) => ({
                  name: s.name,
                  type: s.type === "number" ? "number" : "text",
                  required: s.required,
                })) || [],
              rows: [],
            }));

          const combined = [
            ...liveDatasets,
            ...MOCK_DATASETS.filter((md) => !liveDatasets.some((ld) => ld.id === md.id)),
          ];
          setDatasets(combined);
        }
      } catch (err) {
        console.warn("Could not load backend datasets, using mock data", err);
      }
    }
    loadDatasets();
  }, []);

  const filtered = useMemo(
    () => datasets.filter((d) => d.name.toLowerCase().includes(query.toLowerCase())),
    [datasets, query]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pagedDatasets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    try {
      if (id.includes("-")) {
        await api.deleteTask(id);
      }
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (pagedDatasets.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.warn("Could not delete dataset", err);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-tan mb-1">
            <ShipLogIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CARGO MANIFESTS
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Datasets
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Clean, source-backed intelligence structured from your research missions.
          </p>
        </div>
        <div className="relative w-full max-w-[240px]">
          <SpyglassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search datasets…"
            className="h-8 pl-8 text-[13px] bg-card border-border/80"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShipLogIcon}
          title="No datasets yet"
          description="Completed research missions will store verified records here."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {pagedDatasets.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/dashboard/datasets/${d.id}`}>
                  <Card className="h-full border-border bg-card transition-all hover:border-tan/60 hover:shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-semibold leading-snug text-foreground">
                          {d.name}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant={d.status === "ready" ? "success" : "warning"}>
                            {d.status === "ready" ? "Ready" : "Partial"}
                          </Badge>
                          <button
                            type="button"
                            title="Delete dataset"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(d.id);
                            }}
                            className="p-1 rounded-md text-muted-foreground/70 hover:text-danger hover:bg-danger-soft/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] text-muted-foreground leading-relaxed">
                        {d.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[12px] font-medium text-muted-foreground border-t border-border/40 pt-2.5">
                        <span>{formatNumber(d.recordCount)} records</span>
                        <span>{d.sourceCount} sources</span>
                        <span>{formatDate(d.updatedAt)}</span>
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
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemName="datasets"
          />
        </div>
      )}
    </div>
  );
}
