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
  // --- Startup & Investment Directories ---
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

  // --- Job Openings & ATS Portals ---
  {
    id: "src_job_1",
    url: "https://boards.greenhouse.io",
    domain: "greenhouse.io",
    title: "Greenhouse ATS — Engineering Roles",
    type: "Job board",
    status: "accepted",
    retrievedAt: "2026-09-24T08:05:00Z",
    recordsContributed: 52,
    reliability: "high",
    snippet: "Direct enterprise Applicant Tracking System postings for remote and onsite technical roles.",
  },
  {
    id: "src_job_2",
    url: "https://jobs.lever.co",
    domain: "lever.co",
    title: "Lever Postings — Software Careers",
    type: "Job board",
    status: "accepted",
    retrievedAt: "2026-09-24T08:06:00Z",
    recordsContributed: 38,
    reliability: "high",
    snippet: "Public job opening directories across fast-growing tech companies and venture-backed startups.",
  },
  {
    id: "src_job_3",
    url: "https://wellfound.com/jobs",
    domain: "wellfound.com",
    title: "Wellfound (AngelList) — Startup Talent",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-24T08:08:00Z",
    recordsContributed: 44,
    reliability: "high",
    snippet: "Verified venture-backed startup job listings with transparent compensation and equity stakes.",
  },
  {
    id: "src_job_4",
    url: "https://remoteok.com/remote-frontend-jobs",
    domain: "remoteok.com",
    title: "RemoteOK — Global Remote Listings",
    type: "Job board",
    status: "accepted",
    retrievedAt: "2026-09-24T08:09:00Z",
    recordsContributed: 67,
    reliability: "high",
    snippet: "Aggregated remote software engineering positions posted across global distributed teams.",
  },
  {
    id: "src_job_5",
    url: "https://talent-intranet.enterprise-portal.internal/jobs",
    domain: "enterprise-portal.internal",
    title: "Internal Enterprise Job Portal",
    type: "Intranet",
    status: "skipped",
    reason: "Private intranet requires corporate VPN & Single Sign-On",
    retrievedAt: "2026-09-24T08:10:00Z",
    recordsContributed: 0,
    reliability: "low",
    snippet: "Restricted corporate network endpoint. Automated retrieval blocked per compliance policy.",
  },

  // --- Sales Leads & B2B Prospecting ---
  {
    id: "src_sales_1",
    url: "https://www.crunchbase.com/discover/organization.companies",
    domain: "crunchbase.com",
    title: "Crunchbase — High-Growth Companies",
    type: "Market data",
    status: "accepted",
    retrievedAt: "2026-09-23T11:15:00Z",
    recordsContributed: 92,
    reliability: "high",
    snippet: "Verified business profiles, founding executives, funding rounds, and headquarters for B2B prospects.",
  },
  {
    id: "src_sales_2",
    url: "https://www.apollo.io/companies",
    domain: "apollo.io",
    title: "Apollo Public Directory — B2B Companies",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-23T11:18:00Z",
    recordsContributed: 74,
    reliability: "high",
    snippet: "Company firmographics, employee headcounts, and verified domain intelligence.",
  },
  {
    id: "src_sales_3",
    url: "https://www.producthunt.com",
    domain: "producthunt.com",
    title: "Product Hunt — New SaaS Launches",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-23T11:22:00Z",
    recordsContributed: 46,
    reliability: "high",
    snippet: "Newly launched SaaS tools, founding maker profiles, and early adopter traction signals.",
  },
  {
    id: "src_sales_4",
    url: "https://www.linkedin.com/in/private-prospects",
    domain: "linkedin.com",
    title: "LinkedIn Sales Navigator Network",
    type: "Profile",
    status: "skipped",
    reason: "Rate-limited and authentication required for member personal profiles",
    retrievedAt: "2026-09-23T11:25:00Z",
    recordsContributed: 0,
    reliability: "medium",
    snippet: "Social graph protected by anti-scraping measures. Respecting rate-limit & access policies.",
  },

  // --- Sponsorship Opportunities & Conferences ---
  {
    id: "src_spon_1",
    url: "https://devpost.com/hackathons",
    domain: "devpost.com",
    title: "Devpost — Global Hackathon Sponsors",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-19T14:05:00Z",
    recordsContributed: 28,
    reliability: "high",
    snippet: "Public hackathon sponsorship listings, prize bounty sponsors, and organizer contact details.",
  },
  {
    id: "src_spon_2",
    url: "https://lu.ma/discover/tech-summits",
    domain: "lu.ma",
    title: "Lu.ma — Tech Summits & Founder Mixers",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-19T14:09:00Z",
    recordsContributed: 35,
    reliability: "high",
    snippet: "Curated community tech summits, founder breakfasts, and conference partnership tiers.",
  },
  {
    id: "src_spon_3",
    url: "https://www.eventbrite.com/d/online/tech-conferences",
    domain: "eventbrite.com",
    title: "Eventbrite — Developer Conferences",
    type: "Directory",
    status: "accepted",
    retrievedAt: "2026-09-19T14:14:00Z",
    recordsContributed: 21,
    reliability: "medium",
    snippet: "Public conference listings with organizer links, ticket pricing, and sponsor prospectus pages.",
  },
  {
    id: "src_spon_4",
    url: "https://exclusive-summits.example.com/sponsor-kit",
    domain: "exclusive-summits.example.com",
    title: "Exclusive Summit Sponsor Dossier",
    type: "Directory",
    status: "skipped",
    reason: "Subscription paywall ($4,500/yr required for prospectus access)",
    retrievedAt: "2026-09-19T14:18:00Z",
    recordsContributed: 0,
    reliability: "low",
    snippet: "Commercial portal behind paywall barrier. Skipped in accordance with source terms.",
  },

  // --- Market Data & SaaS Pricing Intelligence ---
  {
    id: "src_mkt_1",
    url: "https://www.g2.com/categories/project-management",
    domain: "g2.com",
    title: "G2 — SaaS Pricing & Feature Grid",
    type: "Market data",
    status: "accepted",
    retrievedAt: "2026-09-17T11:42:00Z",
    recordsContributed: 18,
    reliability: "high",
    snippet: "Vendor pricing tiers, monthly seat costs, and verified customer capability breakdowns.",
  },
  {
    id: "src_mkt_2",
    url: "https://www.sec.gov/edgar/searchedgar/companysearch",
    domain: "sec.gov",
    title: "SEC EDGAR — Public Filings & 10-K Data",
    type: "Market data",
    status: "accepted",
    retrievedAt: "2026-09-17T11:45:00Z",
    recordsContributed: 14,
    reliability: "high",
    snippet: "Public corporate disclosure reports, revenue metrics, and regulated financial statements.",
  },
  {
    id: "src_mkt_3",
    url: "https://www.capterra.com/project-management-software",
    domain: "capterra.com",
    title: "Capterra — Software Pricing Index",
    type: "Market data",
    status: "accepted",
    retrievedAt: "2026-09-17T11:48:00Z",
    recordsContributed: 15,
    reliability: "high",
    snippet: "Side-by-side pricing models, free tier limitations, and enterprise licensing fees.",
  },
  {
    id: "src_mkt_4",
    url: "https://bloomberg.com/enterprise/data",
    domain: "bloomberg.com",
    title: "Bloomberg Professional Terminal",
    type: "Market data",
    status: "skipped",
    reason: "Hardware token & proprietary Bloomberg API license required",
    retrievedAt: "2026-09-17T11:50:00Z",
    recordsContributed: 0,
    reliability: "low",
    snippet: "Proprietary financial terminal requiring non-public credentials. Skipped per compliance.",
  },
];

export const MOCK_DATASET_ROWS: DatasetRow[] = [
  { id: "row_1", data: { company: "Neurabase", founder: "Ananya Rao", website: "neurabase.ai", funding: "$4.2M", linkedin: "linkedin.com/company/neurabase" }, sourceIds: ["src_1", "src_2", "src_sales_1"], confidence: 96, isValid: true, collectedAt: "2026-09-22T09:20:00Z" },
  { id: "row_2", data: { company: "Vantra Labs", founder: "Rohan Mehta", website: "vantralabs.com", funding: "$1.8M", linkedin: "linkedin.com/company/vantra-labs" }, sourceIds: ["src_1", "src_sales_2"], confidence: 88, isValid: true, collectedAt: "2026-09-22T09:21:00Z" },
  { id: "row_3", data: { company: "Cognivue", founder: "Sara Iyer", website: "cognivue.io", funding: "$6.5M", linkedin: "linkedin.com/company/cognivue" }, sourceIds: ["src_2", "src_4", "src_sales_1"], confidence: 92, isValid: true, collectedAt: "2026-09-22T09:22:00Z" },
  { id: "row_4", data: { company: "Pulseform", founder: "Kabir Shah", website: "pulseform.co", funding: "Undisclosed", linkedin: "linkedin.com/company/pulseform" }, sourceIds: ["src_1", "src_sales_3"], confidence: 74, isValid: true, collectedAt: "2026-09-22T09:23:00Z" },
  { id: "row_5", data: { company: "Orbital AI", founder: "Meera Nair", website: "orbital.ai", funding: "$12M", linkedin: "linkedin.com/company/orbital-ai" }, sourceIds: ["src_2", "src_sales_1"], confidence: 90, isValid: true, collectedAt: "2026-09-22T09:24:00Z" },
  { id: "row_6", data: { company: "Fluxwave", founder: "Aditya Verma", website: "fluxwave.tech", funding: "$900K", linkedin: "linkedin.com/company/fluxwave" }, sourceIds: ["src_4", "src_sales_3"], confidence: 68, isValid: true, collectedAt: "2026-09-22T09:25:00Z" },
  { id: "row_7", data: { company: "Sentiro", founder: "Divya Kapoor", website: "sentiro.in", funding: "$3.1M", linkedin: "linkedin.com/company/sentiro" }, sourceIds: ["src_1", "src_4", "src_sales_2"], confidence: 94, isValid: true, collectedAt: "2026-09-22T09:26:00Z" },
  { id: "row_8", data: { company: "Nimbus Cognition", founder: "Farhan Ali", website: "nimbuscognition.com", funding: "$2.4M", linkedin: "linkedin.com/company/nimbus-cognition" }, sourceIds: ["src_2", "src_sales_1"], confidence: 81, isValid: true, collectedAt: "2026-09-22T09:27:00Z" },
];

export const MOCK_SPONSOR_ROWS: DatasetRow[] = [
  { id: "row_s1", data: { event: "AI Summit San Francisco 2026", organizer: "AI Conf Global", tier: "Platinum ($25,000)", deadline: "Oct 15, 2026", contact: "sponsors@aisummit.io" }, sourceIds: ["src_spon_2", "src_spon_3"], confidence: 95, isValid: true, collectedAt: "2026-09-19T14:10:00Z" },
  { id: "row_s2", data: { event: "PyData Global Developers", organizer: "NumFOCUS Foundation", tier: "Gold ($12,000)", deadline: "Nov 01, 2026", contact: "admin@numfocus.org" }, sourceIds: ["src_spon_1", "src_spon_2"], confidence: 98, isValid: true, collectedAt: "2026-09-19T14:12:00Z" },
  { id: "row_s3", data: { event: "KubeCon + CloudNativeCon NA", organizer: "Linux Foundation", tier: "Diamond ($40,000)", deadline: "Oct 30, 2026", contact: "sponsorships@cncf.io" }, sourceIds: ["src_spon_3"], confidence: 96, isValid: true, collectedAt: "2026-09-19T14:15:00Z" },
  { id: "row_s4", data: { event: "HackMIT Global Hackathon", organizer: "Tech Student Alliance", tier: "Title Sponsor ($8,500)", deadline: "Nov 12, 2026", contact: "team@hackmit.org" }, sourceIds: ["src_spon_1"], confidence: 91, isValid: true, collectedAt: "2026-09-19T14:18:00Z" },
  { id: "row_s5", data: { event: "FinTech Frontiers Summit NYC", organizer: "FinTech Guild", tier: "Silver ($7,000)", deadline: "Dec 05, 2026", contact: "partners@fintechfrontiers.com" }, sourceIds: ["src_spon_2", "src_spon_3"], confidence: 89, isValid: true, collectedAt: "2026-09-19T14:20:00Z" },
  { id: "row_s6", data: { event: "Enterprise AI & Agentic World", organizer: "Frontier Events", tier: "Gold ($15,000)", deadline: "Nov 20, 2026", contact: "sponsor@agenticworld.ai" }, sourceIds: ["src_spon_2"], confidence: 94, isValid: true, collectedAt: "2026-09-19T14:22:00Z" },
];

export const MOCK_PRICING_ROWS: DatasetRow[] = [
  { id: "row_p1", data: { product: "Linear", plan: "Standard", price: "$8 / user / mo", billing: "Annual", user_limit: "Unlimited" }, sourceIds: ["src_mkt_1"], confidence: 97, isValid: true, collectedAt: "2026-09-17T11:43:00Z" },
  { id: "row_p2", data: { product: "Linear", plan: "Plus", price: "$14 / user / mo", billing: "Annual", user_limit: "Unlimited" }, sourceIds: ["src_mkt_1"], confidence: 98, isValid: true, collectedAt: "2026-09-17T11:44:00Z" },
  { id: "row_p3", data: { product: "Jira Software", plan: "Standard", price: "$7.16 / user / mo", billing: "Monthly", user_limit: "Up to 35,000 users" }, sourceIds: ["src_mkt_1", "src_mkt_3"], confidence: 95, isValid: true, collectedAt: "2026-09-17T11:46:00Z" },
  { id: "row_p4", data: { product: "Jira Software", plan: "Premium", price: "$12.48 / user / mo", billing: "Monthly", user_limit: "Unlimited" }, sourceIds: ["src_mkt_1", "src_mkt_3"], confidence: 96, isValid: true, collectedAt: "2026-09-17T11:47:00Z" },
  { id: "row_p5", data: { product: "Asana", plan: "Starter", price: "$10.99 / user / mo", billing: "Annual", user_limit: "Up to 500 users" }, sourceIds: ["src_mkt_3"], confidence: 92, isValid: true, collectedAt: "2026-09-17T11:49:00Z" },
  { id: "row_p6", data: { product: "Monday.com", plan: "Standard", price: "$12 / seat / mo", billing: "Annual (min 3 seats)", user_limit: "Team tier" }, sourceIds: ["src_mkt_1", "src_mkt_3"], confidence: 94, isValid: true, collectedAt: "2026-09-17T11:51:00Z" },
];

export const MOCK_JOB_ROWS: DatasetRow[] = [
  { id: "row_j1", data: { title: "Senior Frontend Engineer (React/Next.js)", company: "Supabase", salary: "$150,000 - $185,000", location: "Remote (Worldwide)", apply_url: "https://boards.greenhouse.io/supabase/jobs/401" }, sourceIds: ["src_job_1", "src_job_4"], confidence: 98, isValid: true, collectedAt: "2026-09-24T08:06:00Z" },
  { id: "row_j2", data: { title: "Staff UI/UX Engineer", company: "Vercel", salary: "$175,000 - $210,000", location: "Remote (US/Canada)", apply_url: "https://jobs.lever.co/vercel/jobs/502" }, sourceIds: ["src_job_2", "src_job_4"], confidence: 96, isValid: true, collectedAt: "2026-09-24T08:07:00Z" },
  { id: "row_j3", data: { title: "Frontend Architect (Design Systems)", company: "Figma", salary: "$190,000 - $230,000", location: "Remote (US)", apply_url: "https://boards.greenhouse.io/figma/jobs/603" }, sourceIds: ["src_job_1"], confidence: 94, isValid: true, collectedAt: "2026-09-24T08:08:00Z" },
  { id: "row_j4", data: { title: "Lead React Engineer", company: "Retool", salary: "$165,000 - $195,000", location: "Remote (Americas/EMEA)", apply_url: "https://jobs.lever.co/retool/jobs/704" }, sourceIds: ["src_job_2", "src_job_3"], confidence: 92, isValid: true, collectedAt: "2026-09-24T08:09:00Z" },
  { id: "row_j5", data: { title: "Senior Next.js Developer", company: "Perplexity AI", salary: "$160,000 - $200,000", location: "Remote (Global)", apply_url: "https://wellfound.com/company/perplexity-ai/jobs/805" }, sourceIds: ["src_job_3", "src_job_4"], confidence: 95, isValid: true, collectedAt: "2026-09-24T08:10:00Z" },
  { id: "row_j6", data: { title: "Fullstack Core Engineer", company: "Cursor", salary: "$180,000 - $225,000", location: "Remote (US/EU)", apply_url: "https://remoteok.com/remote-jobs/cursor-core-fe" }, sourceIds: ["src_job_4"], confidence: 93, isValid: true, collectedAt: "2026-09-24T08:11:00Z" },
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
      { name: "contact", type: "text", required: false },
    ],
    rows: MOCK_SPONSOR_ROWS,
  },
  {
    id: "ds_3",
    workflowId: "wf_3",
    name: "PM Tool Pricing Comparison",
    description: "Pricing plans across leading project management SaaS products.",
    recordCount: 15,
    sourceCount: 15,
    status: "ready",
    createdAt: "2026-09-17T11:40:00Z",
    updatedAt: "2026-09-17T11:52:00Z",
    fields: [
      { name: "product", type: "text", required: true },
      { name: "plan", type: "text", required: true },
      { name: "price", type: "text", required: true },
      { name: "billing", type: "text", required: false },
      { name: "user_limit", type: "text", required: false },
    ],
    rows: MOCK_PRICING_ROWS,
  },
  {
    id: "ds_4",
    workflowId: "wf_4",
    name: "Remote Frontend Jobs",
    description: "Remote frontend and fullstack developer job openings with compensation and application links.",
    recordCount: 97,
    sourceCount: 20,
    status: "ready",
    createdAt: "2026-09-24T08:02:00Z",
    updatedAt: "2026-09-24T08:11:00Z",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "company", type: "text", required: true },
      { name: "salary", type: "text", required: false },
      { name: "location", type: "text", required: false },
      { name: "apply_url", type: "url", required: false },
    ],
    rows: MOCK_JOB_ROWS,
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
    status: "completed",
    progress: 100,
    createdAt: "2026-09-24T08:02:00Z",
    updatedAt: "2026-09-24T08:11:00Z",
    durationSec: 540,
    recordsFound: 132,
    validRecords: 97,
    duplicates: 14,
    sourcesProcessed: 20,
    sourcesTotal: 20,
    stages: stages(7),
    datasetId: "ds_4",
    contract: {
      entity: "job listing",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "company", type: "text", required: true },
        { name: "salary", type: "text", required: false },
        { name: "location", type: "text", required: false },
        { name: "apply_url", type: "url", required: false },
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
