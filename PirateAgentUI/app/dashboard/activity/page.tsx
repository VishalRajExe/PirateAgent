"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShipWheelIcon,
  LighthouseIcon,
  TreasureChestIcon,
  AnchorCheckIcon,
  TreasureMapIcon,
  ShipLogIcon,
  CargoIcon,
} from "@/components/icons";
import { EmptyState } from "@/components/common/empty-state";
import { MOCK_ACTIVITY } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const ICON_MAP: Record<ActivityItem["icon"], React.ElementType> = {
  start: ShipWheelIcon,
  source: LighthouseIcon,
  collect: TreasureChestIcon,
  validate: AnchorCheckIcon,
  dedupe: TreasureMapIcon,
  dataset: ShipLogIcon,
  export: CargoIcon,
};

const TONE_MAP: Record<ActivityItem["icon"], string> = {
  start: "bg-surface text-tan border border-border",
  source: "bg-surface text-muted-foreground border border-border",
  collect: "bg-surface text-primary border border-border",
  validate: "bg-success-soft text-success border border-success/30",
  dedupe: "bg-warning-soft text-warning border border-warning/30",
  dataset: "bg-surface text-primary border border-border",
  export: "bg-surface text-tan border border-border",
};

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>(MOCK_ACTIVITY);

  useEffect(() => {
    async function loadBackendActivity() {
      try {
        const tasks = await api.getTasks();
        const liveItems: ActivityItem[] = [];

        tasks.forEach((t) => {
          (t.logs || []).forEach((log) => {
            let icon: ActivityItem["icon"] = "collect";
            const step = log.step.toLowerCase();
            if (step.includes("plan")) icon = "start";
            else if (step.includes("search")) icon = "source";
            else if (step.includes("extract")) icon = "collect";
            else if (step.includes("quality") || step.includes("valid")) icon = "validate";
            else if (step.includes("dedup")) icon = "dedupe";
            else if (step.includes("complete")) icon = "dataset";

            liveItems.push({
              id: `task-${t.id}-${log.id}`,
              icon,
              text: `[${t.workflowPlan?.targetEntityType || t.userPrompt.slice(0, 32)}] ${log.message}`,
              workflowId: t.id,
              timestamp: log.timestamp,
            });
          });
        });

        if (liveItems.length > 0) {
          // Sort reverse chronologically
          liveItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivity([...liveItems.slice(0, 30), ...MOCK_ACTIVITY]);
        }
      } catch (err) {
        console.warn("Could not load backend logs for activity", err);
      }
    }
    loadBackendActivity();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-tan mb-1">
          <ShipWheelIcon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            COMMAND LOG
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Activity
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Live stream of operational events, extractions, and validations across active missions.
        </p>
      </div>

      {activity.length === 0 ? (
        <EmptyState
          icon={ShipWheelIcon}
          title="No activity yet"
          description="Actions across your research missions will stream here in real time."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 shadow-subtle">
          <ol className="space-y-1">
            {activity.map((item, i) => {
              const Icon = ICON_MAP[item.icon];
              const content = (
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full shadow-xs",
                        TONE_MAP[item.icon]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {i < activity.length - 1 && (
                      <span className="mt-1 h-full min-h-[24px] w-px flex-1 bg-border/80" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="text-[13.5px] font-medium text-foreground">{item.text}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={item.id}>
                  {item.workflowId ? (
                    <Link
                      href={`/dashboard/workflows/${item.workflowId}`}
                      className="block rounded-lg p-1.5 transition-colors hover:bg-surface"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="p-1.5">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
