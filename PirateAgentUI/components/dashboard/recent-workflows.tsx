import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TreasureMapIcon, SailingShipIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import type { Workflow } from "@/lib/types";

export function RecentWorkflows({ workflows }: { workflows: Workflow[] }) {
  return (
    <Card className="border-border bg-card shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <TreasureMapIcon className="h-4 w-4 text-tan" />
          <CardTitle className="font-serif text-lg font-bold tracking-tight text-foreground">
            Recent workflows
          </CardTitle>
        </div>
        <Link
          href="/dashboard/workflows"
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-0.5 pt-2">
        {workflows.length === 0 ? (
          <EmptyState
            icon={SailingShipIcon}
            title="No voyages yet"
            description="Start a research mission and PirateAgent will collect the data for you."
          />
        ) : (
          workflows.map((w) => (
            <Link
              key={w.id}
              href={`/dashboard/workflows/${w.id}`}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface border-b border-border/30 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-foreground">{w.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {formatNumber(w.validRecords)} records · {formatRelativeTime(w.updatedAt)}
                </p>
              </div>
              <StatusBadge status={w.status} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
