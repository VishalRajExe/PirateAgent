"use client";
import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SpyglassIcon, CargoIcon, LighthouseIcon, ShipLogIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExportMenu } from "@/components/dataset/export-menu";
import { DataTable, type SortState } from "@/components/dataset/data-table";
import { SourceDrawer } from "@/components/dataset/source-drawer";
import { EmptyState } from "@/components/common/empty-state";
import { getDataset, getSourcesFor } from "@/lib/mock-data";
import { api, backendDatasetToUi } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Dataset, DatasetRow, SourceRecord } from "@/lib/types";

const PAGE_SIZE = 10;

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(() => getDataset(params.id) || null);
  const [extraSources, setExtraSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(!dataset);

  const [query, setQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState>({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [activeRow, setActiveRow] = useState<DatasetRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (dataset) return;

    async function fetchBackendDataset() {
      try {
        const [backendDs, task] = await Promise.all([
          api.getDataset(params.id),
          api.getTask(params.id),
        ]);

        if (backendDs) {
          const uiDs = backendDatasetToUi(backendDs, task || undefined);
          setDataset(uiDs);

          const sourcesList: SourceRecord[] = (backendDs.sources || []).map((s) => ({
            id: String(s.id),
            url: s.url,
            domain: s.domain,
            title: s.title,
            type: "Authorized Source",
            status: "accepted",
            retrievedAt: backendDs.createdAt,
            recordsContributed: s.recordsExtracted,
            reliability: "high",
            snippet: s.snippet,
          }));
          setExtraSources(sourcesList);
        }
      } catch (err) {
        console.warn("Could not load backend dataset", params.id, err);
      } finally {
        setLoading(false);
      }
    }

    fetchBackendDataset();
  }, [params.id, dataset]);

  const filtered = useMemo(() => {
    if (!dataset) return [];
    let rows = dataset.rows.filter((r) =>
      query ? Object.values(r.data).some((v) => String(v).toLowerCase().includes(query.toLowerCase())) : true
    );
    if (confidenceFilter === "high") rows = rows.filter((r) => r.confidence >= 85);
    if (confidenceFilter === "medium") rows = rows.filter((r) => r.confidence >= 70 && r.confidence < 85);
    if (confidenceFilter === "low") rows = rows.filter((r) => r.confidence < 70);

    if (sort.key) {
      rows = [...rows].sort((a, b) => {
        const av = String(a.data[sort.key as string] ?? "");
        const bv = String(b.data[sort.key as string] ?? "");
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [dataset, query, confidenceFilter, sort]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dataset) {
    notFound();
  }

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const allSelected = pageRows.every((r) => prev.has(r.id));
      const next = new Set(prev);
      pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }

  function handleSort(key: string) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function openRow(row: DatasetRow) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  const selectedRows = dataset.rows.filter((r) => selected.has(r.id));
  const exportRows = selectedRows.length > 0 ? selectedRows : filtered;

  const currentSources = activeRow
    ? [
        ...getSourcesFor(activeRow.sourceIds),
        ...extraSources.filter((s) => activeRow.sourceIds.includes(s.id)),
      ]
    : [];

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/datasets")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All datasets
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {dataset.name}
            </h1>
            <Badge variant={dataset.status === "ready" ? "success" : "warning"}>
              {dataset.status === "ready" ? "Ready" : "Partial"}
            </Badge>
          </div>
          <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
            {dataset.description}
          </p>
        </div>
        <ExportMenu rows={exportRows} name={dataset.name} count={selectedRows.length} />
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="border-border bg-card shadow-subtle">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-tan">
              <CargoIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold leading-none text-foreground">{formatNumber(dataset.recordCount)}</p>
              <p className="mt-1 text-[11.5px] font-medium text-muted-foreground">Verified Records</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-subtle">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-tan">
              <LighthouseIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold leading-none text-foreground">{dataset.sourceCount}</p>
              <p className="mt-1 text-[11.5px] font-medium text-muted-foreground">Sources Used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-subtle">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-tan">
              <ShipLogIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif text-base font-bold leading-none text-foreground">{formatDate(dataset.updatedAt)}</p>
              <p className="mt-1 text-[11.5px] font-medium text-muted-foreground">Last Updated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-[260px]">
          <SpyglassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search records…"
            className="h-8 pl-8 text-[13px] bg-card border-border/80"
          />
        </div>
        <select
          value={confidenceFilter}
          onChange={(e) => {
            setConfidenceFilter(e.target.value as typeof confidenceFilter);
            setPage(1);
          }}
          className="h-8 rounded-md border border-border bg-card px-2.5 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-medium"
        >
          <option value="all">All confidence</option>
          <option value="high">High (85%+)</option>
          <option value="medium">Medium (70–84%)</option>
          <option value="low">Low (&lt;70%)</option>
        </select>
      </div>

      {dataset.rows.length === 0 ? (
        <EmptyState
          icon={ShipLogIcon}
          title="No records yet"
          description="This dataset hasn't finished collecting records."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SpyglassIcon}
          title="No matching records"
          description="Try a different search term or filter."
        />
      ) : (
        <DataTable
          fields={dataset.fields}
          rows={pageRows}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          selected={selected}
          sort={sort}
          onSort={handleSort}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          onOpenRow={openRow}
          onPageChange={setPage}
        />
      )}

      <SourceDrawer
        row={activeRow}
        sources={currentSources}
        fields={dataset.fields}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
