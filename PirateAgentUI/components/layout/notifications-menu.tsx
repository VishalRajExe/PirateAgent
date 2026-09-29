"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Trash2, ExternalLink, Sparkles, Database, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
  type: "success" | "info" | "plan";
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Mission Completed",
    description: "Remote Job Openings dataset is verified and ready for export (13 records).",
    time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    link: "/dashboard/datasets",
    type: "success",
  },
  {
    id: "notif-2",
    title: "Gemini Strategy Formulated",
    description: "LLM Training Chip Providers schema and 4 search queries established.",
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    link: "/dashboard/workflows",
    type: "plan",
  },
  {
    id: "notif-3",
    title: "Tavily Intelligence Ingestion",
    description: "20 authorized source pages analyzed across tech recruitment ports.",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    link: "/dashboard/sources",
    type: "info",
  },
];

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadTaskNotifications() {
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          const liveNotifs: NotificationItem[] = tasks.slice(0, 3).map((t) => ({
            id: `task-notif-${t.id}`,
            title: t.status === "COMPLETED" ? "Voyage Completed" : `Mission ${t.status}`,
            description: `${t.workflowPlan?.targetEntityType || t.userPrompt.slice(0, 35)} (${t.totalRecords || 0} records collected)`,
            time: t.completedAt || t.createdAt,
            read: false,
            link: t.status === "COMPLETED" ? `/dashboard/datasets/${t.id}` : `/dashboard/workflows/live?taskId=${t.id}`,
            type: t.status === "COMPLETED" ? "success" : "plan",
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const fresh = liveNotifs.filter((n) => !existingIds.has(n.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not load backend notifications", err);
      }
    }
    loadTaskNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors focus:outline-none"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tan" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] max-w-[95vw] rounded-xl border border-border bg-card p-0 shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[15px] text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-tan/20 px-2 py-0.5 text-[11px] font-semibold text-tan">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 px-2 text-[11.5px] text-muted-foreground hover:text-foreground"
                title="Mark all as read"
              >
                <Check className="h-3 w-3 mr-1" /> Mark read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-danger"
                title="Clear all"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-[13px]">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => {
              const Icon =
                n.type === "success"
                  ? CheckCircle2
                  : n.type === "plan"
                  ? Sparkles
                  : Database;
              const iconTone =
                n.type === "success"
                  ? "text-success bg-success-soft/30 border-success/30"
                  : n.type === "plan"
                  ? "text-tan bg-tan/10 border-tan/30"
                  : "text-info bg-info-soft/30 border-info/30";

              const itemContent = (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    n.read ? "bg-card/40 opacity-75 hover:bg-surface/50" : "bg-surface/80 hover:bg-surface"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconTone}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[13px] font-semibold text-foreground truncate">{n.title}</p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tan" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug line-clamp-2">
                      {n.description}
                    </p>
                    <p className="mt-1 text-[10.5px] font-medium text-muted-foreground/80">
                      {formatRelativeTime(n.time)}
                    </p>
                  </div>
                </div>
              );

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                  }}
                  className="block"
                >
                  {itemContent}
                </Link>
              ) : (
                itemContent
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="bg-border/60 m-0" />
        <div className="p-2 text-center bg-surface/40">
          <Link
            href="/dashboard/activity"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary hover:underline py-1"
          >
            View full mission command log <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
