import { ActivityItem, Dataset, DatasetRow, SourceRecord, StageState, Workflow } from "./types";

export const STAGE_TEMPLATE: { key: StageState["key"]; label: string }[] = [
  { key: "understand", label: "Understand requirement" },
  { key: "discover", label: "Discover permitted sources" },
  { key: "collect", label: "Collect data" },
  { key: "extract", label: "Extract fields" },
  { key: "validate", label: "Validate records" },
  { key: "dedupe", label: "Remove duplicates" },
  { key: "build", label: "Build dataset" },
];

function stages(doneCount: number, activeIdx?: number): StageState[] {
  return STAGE_TEMPLATE.map((s, i) => ({
    ...s,
    status: i < doneCount ? "done" : i === activeIdx ? "active" : "pending",
  }));
}

export const EXAMPLE_PROMPTS = [
  "Find 200 AI startups in India with founder, website, funding and LinkedIn",
  "List sponsorship opportunities for tech conferences in the US this year",
  "Collect pricing plans for the top 15 project management tools",
  "Find remote frontend job openings posted this month with salary",
];

export const MOCK_SOURCES: SourceRecord[] = [
  {
    id: "src_1",
    url: "https://www.ycombinator.com/companies?query=AI",
    domain: "ycombinator.com",
    title: "YC Startup Directory — AI",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-22T09:14:00Z",
    recordsContributed: 84,
    reliability: "high",
    snippet: "A curated list of AI-focused companies backed by Y Combinator, including stage and location.",
  },
  {
    id: "src_2",
    url: "https://tracxn.com/explore/AI-Startups-in-India",
    domain: "tracxn.com",
    title: "AI Startups in India — Tracxn",
    type: "Market data",
    status: "accepted",
    retrievedAt: "2026-09-22T09:16:00Z",
    recordsContributed: 63,
    reliability: "high",
    snippet: "Aggregated funding and founder data for India-based AI companies.",
  },
  {
    id: "src_3",
    url: "https://www.linkedin.com/company/private-profile",
    domain: "linkedin.com",
    title: "Company Page",
    type: "Profile",
    status: "skipped",
    reason: "Login required to view full page",
    retrievedAt: "2026-09-22T09:17:00Z",
    recordsContributed: 0,
    reliability: "medium",
    snippet: "Page requires authentication — skipped per source policy.",
  },
  {
    id: "src_4",
    url: "https://inc42.com/tag/artificial-intelligence/",
    domain: "inc42.com",
    title: "AI Coverage — Inc42",
    type: "News",
    status: "accepted",
    retrievedAt: "2026-09-22T09:19:00Z",
    recordsContributed: 41,
    reliability: "medium",
    snippet: "Editorial coverage mentioning recent funding rounds for AI startups.",
  },
  {
    id: "src_5",
    url: "https://restricted-directory.example.com/robots.txt",
    domain: "restricted-directory.example.com",
    title: "Startup Registry",
    type: "Directory",
    status: "skipped",
    reason: "Disallowed by robots.txt",
    retrievedAt: "2026-09-22T09:20:00Z",
    recordsContributed: 0,
    reliability: "low",
    snippet: "Automated access disallowed for this path.",
  },
];

export const MOCK_DATASET_ROWS: DatasetRow[] = [
  { id: "row_1", data: { company: "Neurabase", founder: "Ananya Rao", website: "neurabase.ai", funding: "$4.2M", linkedin: "linkedin.com/company/neurabase" }, sourceIds: ["src_1", "src_2"], confidence: 96, isValid: true, collectedAt: "2026-09-22T09:20:00Z" },
  { id: "row_2", data: { company: "Vantra Labs", founder: "Rohan Mehta", website: "vantralabs.com", funding: "$1.8M", linkedin: "linkedin.com/company/vantra-labs" }, sourceIds: ["src_1"], confidence: 88, isValid: true, collectedAt: "2026-09-22T09:21:00Z" },
  { id: "row_3", data: { company: "Cognivue", founder: "Sara Iyer", website: "cognivue.io", funding: "$6.5M", linkedin: "linkedin.com/company/cognivue" }, sourceIds: ["src_2", "src_4"], confidence: 92, isValid: true, collectedAt: "2026-09-22T09:22:00Z" },
  { id: "row_4", data: { company: "Pulseform", founder: "Kabir Shah", website: "pulseform.co", funding: "Undisclosed", linkedin: "linkedin.com/company/pulseform" }, sourceIds: ["src_1"], confidence: 74, isValid: true, collectedAt: "2026-09-22T09:23:00Z" },
  { id: "row_5", data: { company: "Orbital AI", founder: "Meera Nair", website: "orbital.ai", funding: "$12M", linkedin: "linkedin.com/company/orbital-ai" }, sourceIds: ["src_2"], confidence: 90, isValid: true, collectedAt: "2026-09-22T09:24:00Z" },
  { id: "row_6", data: { company: "Fluxwave", founder: "Aditya Verma", website: "fluxwave.tech", funding: "$900K", linkedin: "linkedin.com/company/fluxwave" }, sourceIds: ["src_4"], confidence: 68, isValid: true, collectedAt: "2026-09-22T09:25:00Z" },
  { id: "row_7", data: { company: "Sentiro", founder: "Divya Kapoor", website: "sentiro.in", funding: "$3.1M", linkedin: "linkedin.com/company/sentiro" }, sourceIds: ["src_1", "src_4"], confidence: 94, isValid: true, collectedAt: "2026-09-22T09:26:00Z" },
  { id: "row_8", data: { company: "Nimbus Cognition", founder: "Farhan Ali", website: "nimbuscognition.com", funding: "$2.4M", linkedin: "linkedin.com/company/nimbus-cognition" }, sourceIds: ["src_2"], confidence: 81, isValid: true, collectedAt: "2026-09-22T09:27:00Z" },
];

export const MOCK_DATASETS: Dataset[] = [
  {
    id: "ds_1",
    workflowId: "wf_1",
    name: "AI Startups — India",
    description: "Company, founder, website, funding and LinkedIn for India-based AI startups founded after 2020.",
    recordCount: 284,
    sourceCount: 17,
    status: "ready",
    createdAt: "2026-09-22T09:10:00Z",
    updatedAt: "2026-09-22T09:28:00Z",
    fields: [
      { name: "company", type: "text", required: true },
      { name: "founder", type: "text", required: true },
      { name: "website", type: "url", required: true },
      { name: "funding", type: "text", required: false },
      { name: "linkedin", type: "url", required: false },
    ],
    rows: MOCK_DATASET_ROWS,
  },
  {
    id: "ds_2",
    workflowId: "wf_2",
    name: "Conference Sponsorships — US Tech",
    description: "Sponsorship tiers, contact and deadline for US tech conferences in 2026.",
    recordCount: 61,
    sourceCount: 12,
    status: "ready",
    createdAt: "2026-09-19T14:02:00Z",
    updatedAt: "2026-09-19T14:22:00Z",
    fields: [
      { name: "event", type: "text", required: true },
      { name: "organizer", type: "text", required: true },
      { name: "tier", type: "text", required: false },
      { name: "deadline", type: "text", required: false },
    ],
    rows: [],
  },
  {
    id: "ds_3",
    workflowId: "wf_3",
    name: "PM Tool Pricing Comparison",
    description: "Pricing plans across leading project management SaaS products.",
    recordCount: 15,
    sourceCount: 15,
    status: "partial",
    createdAt: "2026-09-17T11:40:00Z",
    updatedAt: "2026-09-17T11:52:00Z",
    fields: [
      { name: "product", type: "text", required: true },
      { name: "plan", type: "text", required: true },
      { name: "price", type: "text", required: true },
    ],
    rows: [],
  },
];

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: "wf_1",
    name: "AI Startups — India",
    prompt: "Find 200 AI startups in India with company name, founder, website, funding and LinkedIn.",
    status: "completed",
    progress: 100,
    createdAt: "2026-09-22T09:08:00Z",
    updatedAt: "2026-09-22T09:28:00Z",
    durationSec: 1200,
    recordsFound: 312,
    validRecords: 284,
    duplicates: 28,
    sourcesProcessed: 17,
    sourcesTotal: 17,
    stages: stages(7),
    datasetId: "ds_1",
    contract: {
      entity: "startup",
      fields: [
        { name: "company", type: "text", required: true },
        { name: "founder", type: "text", required: true },
        { name: "website", type: "url", required: true },
        { name: "funding", type: "text", required: false },
        { name: "linkedin", type: "url", required: false },
      ],
      filters: ["Country: India", "Industry: Artificial Intelligence", "Founded after: 2020"],
      sourceTypes: ["Startup directories", "Funding databases", "News coverage"],
      targetCount: 200,
    },
  },
  {
    id: "wf_2",
    name: "Conference Sponsorships — US Tech",
    prompt: "List sponsorship opportunities for tech conferences in the US this year.",
    status: "completed",
    progress: 100,
    createdAt: "2026-09-19T13:55:00Z",
    updatedAt: "2026-09-19T14:22:00Z",
    durationSec: 1620,
    recordsFound: 68,
    validRecords: 61,
    duplicates: 7,
    sourcesProcessed: 12,
    sourcesTotal: 12,
    stages: stages(7),
    datasetId: "ds_2",
    contract: {
      entity: "sponsorship opportunity",
      fields: [
        { name: "event", type: "text", required: true },
        { name: "organizer", type: "text", required: true },
        { name: "tier", type: "text", required: false },
        { name: "deadline", type: "text", required: false },
      ],
      filters: ["Country: United States", "Category: Technology"],
      sourceTypes: ["Event listing sites", "Organizer pages"],
      targetCount: 75,
    },
  },
  {
    id: "wf_3",
    name: "PM Tool Pricing Comparison",
    prompt: "Collect pricing plans for the top 15 project management tools.",
    status: "failed",
    progress: 46,
    createdAt: "2026-09-17T11:38:00Z",
    updatedAt: "2026-09-17T11:52:00Z",
    durationSec: 840,
    recordsFound: 15,
    validRecords: 15,
    duplicates: 0,
    sourcesProcessed: 6,
    sourcesTotal: 15,
    stages: stages(3, 3),
    datasetId: "ds_3",
    contract: {
      entity: "pricing plan",
      fields: [
        { name: "product", type: "text", required: true },
        { name: "plan", type: "text", required: true },
        { name: "price", type: "text", required: true },
      ],
      filters: ["Category: Project management software"],
      sourceTypes: ["Vendor pricing pages"],
      targetCount: 15,
    },
  },
  {
    id: "wf_4",
    name: "Remote Frontend Jobs",
    prompt: "Find remote frontend job openings posted this month with salary.",
    status: "running",
    progress: 58,
    createdAt: "2026-09-24T08:02:00Z",
    updatedAt: "2026-09-24T08:11:00Z",
    recordsFound: 132,
    validRecords: 97,
    duplicates: 14,
    sourcesProcessed: 9,
    sourcesTotal: 20,
    stages: stages(3, 3),
    contract: {
      entity: "job listing",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "company", type: "text", required: true },
        { name: "salary", type: "text", required: false },
        { name: "location", type: "text", required: false },
      ],
      filters: ["Remote only", "Role: Frontend", "Posted: last 30 days"],
      sourceTypes: ["Job boards", "Company career pages"],
      targetCount: 150,
    },
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "a1", icon: "collect", text: "Collected 14 new records for \u201cRemote Frontend Jobs\u201d", workflowId: "wf_4", timestamp: "2026-09-24T08:11:00Z" },
  { id: "a2", icon: "source", text: "Discovered 3 new sources for \u201cRemote Frontend Jobs\u201d", workflowId: "wf_4", timestamp: "2026-09-24T08:07:00Z" },
  { id: "a3", icon: "start", text: "Started workflow \u201cRemote Frontend Jobs\u201d", workflowId: "wf_4", timestamp: "2026-09-24T08:02:00Z" },
  { id: "a4", icon: "export", text: "Exported \u201cAI Startups — India\u201d as CSV", workflowId: "wf_1", timestamp: "2026-09-22T10:02:00Z" },
  { id: "a5", icon: "dataset", text: "Dataset \u201cAI Startups — India\u201d created with 284 records", workflowId: "wf_1", timestamp: "2026-09-22T09:28:00Z" },
  { id: "a6", icon: "dedupe", text: "Removed 28 duplicate records", workflowId: "wf_1", timestamp: "2026-09-22T09:27:00Z" },
  { id: "a7", icon: "validate", text: "Validated 312 collected records", workflowId: "wf_1", timestamp: "2026-09-22T09:25:00Z" },
];

export function deriveContractFromPrompt(prompt: string): { name: string; contract: import("./types").DataContract } {
  const p = prompt.toLowerCase();

  if (p.includes("startup") || p.includes("founder") || p.includes("ai ")) {
    return {
      name: "AI Startups Research",
      contract: {
        entity: "startup",
        fields: [
          { name: "company", type: "text", required: true },
          { name: "founder", type: "text", required: true },
          { name: "website", type: "url", required: true },
          { name: "funding", type: "text", required: false },
          { name: "linkedin", type: "url", required: false },
        ],
        filters: ["Country: India", "Industry: Artificial Intelligence", "Founded after: 2020"],
        sourceTypes: ["Startup directories", "Funding databases", "News coverage"],
        targetCount: 200,
      },
    };
  }
  if (p.includes("sponsor") || p.includes("conference") || p.includes("event")) {
    return {
      name: "Sponsorship Opportunities",
      contract: {
        entity: "sponsorship opportunity",
        fields: [
          { name: "event", type: "text", required: true },
          { name: "organizer", type: "text", required: true },
          { name: "tier", type: "text", required: false },
          { name: "deadline", type: "text", required: false },
        ],
        filters: ["Country: United States", "Category: Technology"],
        sourceTypes: ["Event listing sites", "Organizer pages"],
        targetCount: 75,
      },
    };
  }
  if (p.includes("pricing") || p.includes("price") || p.includes("plan")) {
    return {
      name: "Pricing Comparison",
      contract: {
        entity: "pricing plan",
        fields: [
          { name: "product", type: "text", required: true },
          { name: "plan", type: "text", required: true },
          { name: "price", type: "text", required: true },
        ],
        filters: ["Category: Software"],
        sourceTypes: ["Vendor pricing pages"],
        targetCount: 15,
      },
    };
  }
  if (p.includes("job") || p.includes("hiring") || p.includes("salary") || p.includes("remote")) {
    return {
      name: "Job Openings Research",
      contract: {
        entity: "job listing",
        fields: [
          { name: "title", type: "text", required: true },
          { name: "company", type: "text", required: true },
          { name: "salary", type: "text", required: false },
          { name: "location", type: "text", required: false },
        ],
        filters: ["Remote only", "Posted: last 30 days"],
        sourceTypes: ["Job boards", "Company career pages"],
        targetCount: 150,
      },
    };
  }
  return {
    name: "Custom Research",
    contract: {
      entity: "record",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "detail", type: "text", required: false },
        { name: "link", type: "url", required: false },
      ],
      filters: [],
      sourceTypes: ["Public web pages"],
      targetCount: 100,
    },
  };
}

export function pickDatasetForEntity(entity: string) {
  const match = MOCK_WORKFLOWS.find((w) => w.contract.entity === entity);
  return match?.datasetId ?? "ds_1";
}

export function getWorkflow(id: string) {
  return MOCK_WORKFLOWS.find((w) => w.id === id);
}
export function getDataset(id: string) {
  return MOCK_DATASETS.find((d) => d.id === id);
}
export function getSourcesFor(ids: string[]) {
  return MOCK_SOURCES.filter((s) => ids.includes(s.id));
}
