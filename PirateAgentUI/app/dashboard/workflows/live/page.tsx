"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { WorkflowRunView } from "@/components/workflow/workflow-run-view";
import { useWorkflowSimulation } from "@/hooks/use-workflow-simulation";
import { api, mapBackendStatus, computeStages, BackendTask } from "@/lib/api";
import type { DataContract } from "@/lib/types";

interface StoredRequest {
  prompt: string;
  name: string;
  contract?: DataContract;
  taskId?: string;
}

function LiveWorkflowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTaskId = searchParams.get("taskId");

  const [request, setRequest] = useState<StoredRequest | null>(null);
  const [ready, setReady] = useState(false);
  const [liveTask, setLiveTask] = useState<BackendTask | null>(null);

  const activeTaskId = paramTaskId || request?.taskId;

  useEffect(() => {
    const raw = sessionStorage.getItem("pirateagent:new-workflow");
    if (raw) {
      setRequest(JSON.parse(raw));
    }
    setReady(true);
  }, []);

  // Poll backend task if activeTaskId exists
  useEffect(() => {
    if (!activeTaskId) return;

    let isMounted = true;
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const task = await api.getTask(activeTaskId!);
        if (task && isMounted) {
          setLiveTask(task);
          // If task completed or failed, we stop polling
          if (task.status === "COMPLETED" || task.status === "FAILED") {
            return;
          }
        }
      } catch (err) {
        console.warn("Polling error for task", activeTaskId, err);
      }

      if (isMounted) {
        timer = setTimeout(poll, 1200);
      }
    }

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeTaskId]);

  // Simulation fallback hook (only runs if no activeTaskId)
  const sim = useWorkflowSimulation(request?.contract?.targetCount ?? 100);

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeTaskId && !liveTask) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-[14px] text-muted-foreground font-medium">Connecting to AI Intelligence Engine...</p>
      </div>
    );
  }

  // If we have live backend task data
  if (liveTask) {
    const stages = computeStages(liveTask.status);
    const logs = (liveTask.logs || []).map((l) => ({
      id: String(l.id),
      text: `[${l.step}] ${l.message}`,
      timestamp: l.timestamp,
    }));

    return (
      <WorkflowRunView
        name={liveTask.workflowPlan?.targetEntityType || liveTask.userPrompt.slice(0, 40)}
        prompt={liveTask.userPrompt}
        status={mapBackendStatus(liveTask.status)}
        progress={liveTask.progress}
        stages={stages}
        recordsFound={liveTask.totalRecords || 0}
        validRecords={liveTask.totalRecords || 0}
        duplicates={0}
        sourcesProcessed={liveTask.workflowPlan?.permittedDomains?.length || 4}
        sourcesTotal={liveTask.workflowPlan?.permittedDomains?.length || 4}
        log={logs.length ? logs : [{ id: "l0", text: "Workflow created", timestamp: liveTask.createdAt }]}
        datasetId={liveTask.status === "COMPLETED" ? liveTask.id : undefined}
        isLive={liveTask.status !== "COMPLETED" && liveTask.status !== "FAILED"}
      />
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <p className="text-[14px] text-muted-foreground font-medium">No active research mission found.</p>
      </div>
    );
  }

  return (
    <WorkflowRunView
      name={request.name}
      prompt={request.prompt}
      status={sim.status === "completed" ? "completed" : sim.status === "paused" ? "paused" : "running"}
      progress={sim.progress}
      stages={sim.stages}
      recordsFound={sim.recordsFound}
      validRecords={sim.validRecords}
      duplicates={sim.duplicates}
      sourcesProcessed={sim.sourcesProcessed}
      sourcesTotal={sim.sourcesTotal}
      log={sim.log}
      datasetId={sim.status === "completed" && request.taskId ? request.taskId : undefined}
      isLive
      onPause={sim.pause}
      onResume={sim.resume}
    />
  );
}

export default function LiveWorkflowPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LiveWorkflowInner />
    </Suspense>
  );
}
