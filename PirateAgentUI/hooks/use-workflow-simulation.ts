"use client";
import { useEffect, useRef, useState } from "react";
import { STAGE_TEMPLATE } from "@/lib/mock-data";
import type { StageState } from "@/lib/types";

export interface LogLine {
  id: string;
  text: string;
  timestamp: string;
}

export interface SimState {
  stages: StageState[];
  progress: number;
  recordsFound: number;
  validRecords: number;
  duplicates: number;
  sourcesProcessed: number;
  sourcesTotal: number;
  status: "running" | "completed" | "paused";
  log: LogLine[];
}

function initialState(sourcesTotal: number): SimState {
  return {
    stages: STAGE_TEMPLATE.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" })),
    progress: 2,
    recordsFound: 0,
    validRecords: 0,
    duplicates: 0,
    sourcesProcessed: 0,
    sourcesTotal,
    status: "running",
    log: [{ id: "l0", text: "Understanding your requirement", timestamp: new Date().toISOString() }],
  };
}

export function useWorkflowSimulation(targetCount: number) {
  const sourcesTotal = Math.max(6, Math.round(targetCount / 12));
  const [state, setState] = useState<SimState>(() => initialState(sourcesTotal));
  const pausedRef = useRef(false);

  useEffect(() => {
    if (state.status === "completed") return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (pausedRef.current || prev.status !== "running") return prev;

        const activeIdx = prev.stages.findIndex((s) => s.status === "active");
        if (activeIdx === -1) return prev;

        const stepSize = 100 / STAGE_TEMPLATE.length;
        const stageCeiling = (activeIdx + 1) * stepSize;
        const newProgress = Math.min(100, prev.progress + Math.random() * 3.5 + 1.5);

        let recordsFound = prev.recordsFound;
        let validRecords = prev.validRecords;
        let duplicates = prev.duplicates;
        let sourcesProcessed = prev.sourcesProcessed;

        if (activeIdx === 1) sourcesProcessed = Math.min(prev.sourcesTotal, sourcesProcessed + (Math.random() > 0.55 ? 1 : 0));
        if (activeIdx === 2 || activeIdx === 3) recordsFound += Math.round(Math.random() * 5);
        if (activeIdx === 4) validRecords = Math.round(recordsFound * 0.92);
        if (activeIdx === 5) {
          duplicates = Math.max(duplicates, Math.round(recordsFound * 0.11));
          validRecords = Math.max(0, recordsFound - duplicates);
        }
        if (activeIdx === 6) sourcesProcessed = prev.sourcesTotal;

        let stages = prev.stages;
        let log = prev.log;

        if (newProgress >= stageCeiling - 0.01) {
          stages = prev.stages.map((s, i) => {
            if (i === activeIdx) return { ...s, status: "done" as const };
            if (i === activeIdx + 1) return { ...s, status: "active" as const };
            return s;
          });
          log = [
            ...prev.log,
            { id: `l${prev.log.length}`, text: `${STAGE_TEMPLATE[activeIdx].label} complete`, timestamp: new Date().toISOString() },
          ];
        }

        const isLastStage = activeIdx === STAGE_TEMPLATE.length - 1;
        const completed = isLastStage && newProgress >= 100;

        return {
          ...prev,
          stages,
          progress: newProgress,
          recordsFound,
          validRecords,
          duplicates,
          sourcesProcessed,
          log,
          status: completed ? "completed" : "running",
        };
      });
    }, 420);

    return () => clearInterval(interval);
  }, [state.status]);

  function pause() {
    pausedRef.current = true;
    setState((s) => ({ ...s, status: "paused" }));
  }
  function resume() {
    pausedRef.current = false;
    setState((s) => ({ ...s, status: "running" }));
  }

  return { ...state, pause, resume };
}
