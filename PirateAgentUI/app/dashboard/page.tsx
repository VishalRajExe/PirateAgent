"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CompassIcon,
  ShipWheelIcon,
  CargoIcon,
  LighthouseIcon,
} from "@/components/icons";
import { PromptBox } from "@/components/dashboard/prompt-box";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentWorkflows } from "@/components/dashboard/recent-workflows";
import { RecentDatasets } from "@/components/dashboard/recent-datasets";
import { MOCK_WORKFLOWS, MOCK_DATASETS } from "@/lib/mock-data";
import { api, taskToWorkflow } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import type { Workflow, Dataset } from "@/lib/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          const liveWorkflows = tasks.map(taskToWorkflow);
          const combinedWorkflows = [
            ...liveWorkflows,
            ...MOCK_WORKFLOWS.filter((mw) => !liveWorkflows.some((lw) => lw.id === mw.id)),
          ];
          setWorkflows(combinedWorkflows);

          const liveDatasets: Dataset[] = tasks
            .filter((t) => t.status === "COMPLETED")
            .map((t) => ({
              id: t.id,
              workflowId: t.id,
              name: t.workflowPlan?.targetEntityType || t.userPrompt.slice(0, 40),
              description: `Extracted dataset: ${t.userPrompt}`,
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

          if (liveDatasets.length > 0) {
            setDatasets([
              ...liveDatasets,
              ...MOCK_DATASETS.filter((md) => !liveDatasets.some((ld) => ld.id === md.id)),
            ]);
          }
        }
      } catch (err) {
        console.warn("Could not load backend tasks, using mock data", err);
      }
    }
    loadBackendData();
  }, []);

  const running = workflows.filter((w) => w.status === "running" || w.status === "planning").length;
  const totalRecords = datasets.reduce((sum, d) => sum + d.recordCount, 0);
  const totalSources = datasets.reduce((sum, d) => sum + d.sourceCount, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PromptBox />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={CompassIcon}
          label="Total workflows"
          value={formatNumber(workflows.length)}
          tone="primary"
        />
        <StatCard
          icon={ShipWheelIcon}
          label="Running now"
          value={formatNumber(running)}
          tone="warning"
        />
        <StatCard
          icon={CargoIcon}
          label="Records collected"
          value={formatNumber(totalRecords)}
          tone="success"
        />
        <StatCard
          icon={LighthouseIcon}
          label="Sources used"
          value={formatNumber(totalSources)}
          tone="default"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentWorkflows workflows={workflows.slice(0, 4)} />
        <RecentDatasets datasets={datasets.slice(0, 4)} />
      </motion.div>
    </motion.div>
  );
}
