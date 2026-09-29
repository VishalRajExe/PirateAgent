"use client";
import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { LighthouseIcon, SpyglassIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/empty-state";
import { MOCK_SOURCES, MOCK_DATASET_ROWS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { SourceRecord, DatasetRow } from "@/lib/types";

import { Pagination } from "@/components/common/pagination";

const PAGE_SIZE = 8;
const RELIABILITY_TONE = { high: "text-success", medium: "text-warning", low: "text-danger" } as const;
const RELIABILITY_ICON = { high: ShieldCheck, medium: ShieldAlert, low: ShieldX } as const;

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<SourceRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<SourceRecord[]>(MOCK_SOURCES);
  const [allRows, setAllRows] = useState<DatasetRow[]>(MOCK_DATASET_ROWS);

  useEffect(() => {
    async function loadBackendSources() {
      try {
        const tasks = await api.getTasks();
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

        const collectedSources: SourceRecord[] = [];
        const collectedRows: DatasetRow[] = [];

        await Promise.all(
          completedTasks.map(async (t) => {
            try {
              const ds = await api.getDataset(t.id);
              if (ds && ds.sources) {
                ds.sources.forEach((s) => {
                  collectedSources.push({
                    id: String(s.id),
                    url: s.url,
                    domain: s.domain,
                    title: s.title,
                    type: "Web Research Port",
                    status: "accepted",
                    retrievedAt: ds.createdAt,
                    recordsContributed: s.recordsExtracted,
                    reliability: "high",
                    snippet: s.snippet,
                  });
                });
                if (ds.records) {
                  ds.records.forEach((r, idx) => {
                    collectedRows.push({
                      id: `${t.id}-${idx}`,
                      data: r,
                      sourceIds: ds.sources.map((s) => String(s.id)),
                      confidence: 90,
                      isValid: true,
                      collectedAt: ds.createdAt,
                    });
                  });
                }
              }
            } catch (e) {
              console.warn("Failed to load dataset sources for", t.id, e);
            }
          })
        );

        if (collectedSources.length > 0) {
          const combined = [
            ...collectedSources,
            ...MOCK_SOURCES.filter((ms) => !collectedSources.some((cs) => cs.domain === ms.domain)),
          ];
          setSources(combined);
          setAllRows([...collectedRows, ...MOCK_DATASET_ROWS]);
        }
      } catch (err) {
        console.warn("Could not load backend sources", err);
      }
    }
    loadBackendSources();
  }, []);

  const filtered = sources.filter(
    (s) => s.domain.toLowerCase().includes(query.toLowerCase()) || s.title.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pagedSources = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openSource(s: SourceRecord) {
    setActive(s);
    setOpen(true);
  }

  const relatedRows = active ? allRows.filter((r) => r.sourceIds.includes(active.id)) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-tan mb-1">
            <LighthouseIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BEACONS & PORTS
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Sources
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Web locations visited during missions, verified for data provenance.
          </p>
        </div>

        <div className="relative w-full max-w-[260px]">
          <SpyglassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search sources…"
            className="h-8 pl-8 text-[13px] bg-card border-border/80"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={LighthouseIcon}
          title="No sources found"
          description="Try a different search term or check mission parameters."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface/90 border-b border-border">
              <tr>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Records</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Reliability</th>
                <th className="px-3.5 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Last visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {pagedSources.map((s) => {
                const RelIcon = RELIABILITY_ICON[s.reliability];
                return (
                  <tr
                    key={s.id}
                    onClick={() => openSource(s)}
                    className="cursor-pointer transition-colors hover:bg-surface/60"
                  >
                    <td className="px-3.5 py-3">
                      <p className="max-w-[260px] truncate font-semibold text-foreground">{s.title}</p>
                      <p className="max-w-[260px] truncate text-[12px] text-muted-foreground">{s.domain}</p>
                    </td>
                    <td className="px-3.5 py-3 text-muted-foreground">{s.type}</td>
                    <td className="px-3.5 py-3 font-medium text-foreground">{s.recordsContributed}</td>
                    <td className="px-3.5 py-3">
                      <Badge variant={s.status === "accepted" ? "success" : "default"}>
                        {s.status === "accepted" ? "Accepted" : "Skipped"}
                      </Badge>
                    </td>
                    <td className="px-3.5 py-3">
                      <RelIcon className={`h-4 w-4 ${RELIABILITY_TONE[s.reliability]}`} />
                    </td>
                    <td className="px-3.5 py-3 text-muted-foreground">{formatRelativeTime(s.retrievedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemName="sources"
            />
          </div>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        {active && (
          <SheetContent className="bg-card border-border shadow-xl">
            <div className="p-6">
              <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-foreground">
                {active.title}
              </SheetTitle>
              <a
                href={active.url.startsWith("http") ? active.url : `https://${active.domain}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-1.5 text-[13px] text-primary hover:underline font-medium"
              >
                {active.url} <ExternalLink className="h-3 w-3" />
              </a>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={active.status === "accepted" ? "success" : "default"}>
                  {active.status === "accepted" ? "Accepted" : "Skipped"}
                </Badge>
                <Badge variant="default">{active.type}</Badge>
                <Badge variant="default" className="capitalize">
                  {active.reliability} reliability
                </Badge>
              </div>

              {active.status === "skipped" && active.reason && (
                <div className="mt-4 rounded-lg bg-warning-soft border border-warning/20 p-3 text-[12.5px] text-warning font-medium">
                  {active.reason}
                </div>
              )}

              <Separator className="my-5 bg-border/60" />

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source summary</p>
              <p className="text-[13px] text-foreground/85 leading-relaxed">{active.snippet}</p>

              {relatedRows.length > 0 && (
                <>
                  <Separator className="my-5 bg-border/60" />
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Records from this source ({relatedRows.length})
                  </p>
                  <div className="space-y-2">
                    {relatedRows.map((r) => (
                      <div key={r.id} className="rounded-md border border-border bg-surface/50 px-3 py-2 text-[13px] font-medium text-foreground">
                        {String(Object.values(r.data)[0])}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
