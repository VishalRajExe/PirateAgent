"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Pencil } from "lucide-react";
import { SpyglassIcon, CompassIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlanPreview } from "@/components/research/plan-preview";
import { parsePromptToContract } from "@/lib/prompt-parser";
import { api } from "@/lib/api";
import type { DataContract } from "@/lib/types";

type Stage = "input" | "analyzing" | "review";

function NewResearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [stage, setStage] = useState<Stage>(initialPrompt ? "analyzing" : "input");
  const [name, setName] = useState("");
  const [contract, setContract] = useState<DataContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stage !== "analyzing") return;

    let cancelled = false;

    async function analyzeWithGemini() {
      try {
        const res = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        if (cancelled) return;
        if (data.success && data.contract) {
          setName(data.contract.name);
          setContract(data.contract);
          setStage("review");
          return;
        }
        throw new Error("No contract returned");
      } catch (err) {
        console.warn("Gemini API unavailable, falling back to local parser:", err);
        if (cancelled) return;
        const result = parsePromptToContract(prompt);
        setName(result.name);
        setContract(result.contract);
        setStage("review");
      }
    }

    analyzeWithGemini();
    return () => { cancelled = true; };
  }, [stage, prompt]);

  function analyze() {
    if (!prompt.trim()) return;
    setStage("analyzing");
  }

  async function startCollection() {
    if (!contract || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Call real Spring Boot backend API
      const task = await api.createTask(prompt, "ALL");
      sessionStorage.setItem(
        "pirateagent:new-workflow",
        JSON.stringify({
          prompt,
          name: task.workflowPlan?.targetEntityType || name,
          contract,
          taskId: task.id,
          startedAt: new Date().toISOString(),
        })
      );
      router.push(`/dashboard/workflows/live?taskId=${task.id}`);
    } catch (err) {
      console.warn("Backend not available, running simulation:", err);
      sessionStorage.setItem(
        "pirateagent:new-workflow",
        JSON.stringify({ prompt, name, contract, startedAt: new Date().toISOString() })
      );
      router.push("/dashboard/workflows/live");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </button>

      <AnimatePresence mode="wait">
        {stage === "input" && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-2 flex items-center gap-2 text-tan">
              <SpyglassIcon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                MISSION BRIEF
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              New research request
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground leading-relaxed">
              Describe the data you need in plain English — PirateAgent will chart the course and collect it.
            </p>
            <Textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find 200 AI startups in India with founder, website, funding and LinkedIn"
              rows={4}
              className="mt-4 text-[14px] bg-card border-border text-foreground"
            />
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold" onClick={analyze}>
              Analyze request <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}

        {stage === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center rounded-xl border border-border bg-card py-16 text-center shadow-subtle"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-tan/20" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border text-tan">
                <CompassIcon className="h-6 w-6 animate-spin" style={{ animationDuration: "6s" }} />
              </span>
            </div>
            <p className="mt-4 font-serif text-lg font-bold text-foreground">Planning research trajectory</p>
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground leading-relaxed">
              Identifying target entities, data contracts, verification filters and source ports with Gemini AI.
            </p>
          </motion.div>
        )}

        {stage === "review" && contract && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-tan">
                  <SpyglassIcon className="h-3.5 w-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your request</p>
                </div>
                <p className="mt-1 text-[13.5px] font-medium leading-snug text-foreground">{prompt}</p>
              </div>
              <button
                type="button"
                onClick={() => setStage("input")}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            <PlanPreview contract={contract} onChange={setContract} />

            <div className="mt-5 flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setStage("input")} disabled={isSubmitting}>
                Edit prompt
              </Button>
              <Button
                onClick={startCollection}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Launching mission…
                  </>
                ) : (
                  <>
                    Create workflow <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NewResearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewResearchInner />
    </Suspense>
  );
}
