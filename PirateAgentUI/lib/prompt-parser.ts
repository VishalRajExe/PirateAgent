import type { DataContract } from "./types";

type EntityDef = {
  entity: string;
  name: string;
  fields: DataContract["fields"];
  sourceTypes: string[];
  extraFilters?: string[];
};

const ENTITY_MAP: Array<{ keywords: string[]; def: EntityDef }> = [
  {
    keywords: ["youtuber", "youtube channel", "youtube creator", "youtubers"],
    def: {
      entity: "YouTube creator", name: "YouTube Creators Research",
      fields: [
        { name: "channel_name", type: "text", required: true },
        { name: "subscribers", type: "number", required: true },
        { name: "niche", type: "text", required: true },
        { name: "channel_url", type: "url", required: true },
        { name: "contact_email", type: "text", required: false },
        { name: "avg_views", type: "number", required: false },
      ],
      sourceTypes: ["YouTube public pages", "Social media directories"],
      extraFilters: ["Platform: YouTube"],
    },
  },
  {
    keywords: ["influencer", "streamer", "vlogger", "tiktoker", "tiktok creator", "content creator"],
    def: {
      entity: "social media influencer", name: "Influencer Research",
      fields: [
        { name: "username", type: "text", required: true },
        { name: "platform", type: "text", required: true },
        { name: "followers", type: "number", required: true },
        { name: "niche", type: "text", required: true },
        { name: "profile_url", type: "url", required: true },
        { name: "contact_email", type: "text", required: false },
      ],
      sourceTypes: ["Social media directories", "Influencer databases"],
    },
  },
  {
    keywords: ["instagram", "instagrammer"],
    def: {
      entity: "Instagram creator", name: "Instagram Influencers Research",
      fields: [
        { name: "username", type: "text", required: true },
        { name: "followers", type: "number", required: true },
        { name: "niche", type: "text", required: true },
        { name: "profile_url", type: "url", required: true },
        { name: "engagement_rate", type: "text", required: false },
      ],
      sourceTypes: ["Instagram public profiles", "Influencer directories"],
      extraFilters: ["Platform: Instagram"],
    },
  },
  {
    keywords: ["podcast", "podcaster"],
    def: {
      entity: "podcast", name: "Podcasts Research",
      fields: [
        { name: "podcast_name", type: "text", required: true },
        { name: "host", type: "text", required: true },
        { name: "category", type: "text", required: true },
        { name: "platform_url", type: "url", required: true },
        { name: "episode_count", type: "number", required: false },
      ],
      sourceTypes: ["Podcast directories", "Spotify/Apple Podcasts pages"],
    },
  },
  {
    keywords: ["startup", "founder", "unicorn", "funded company", "venture"],
    def: {
      entity: "startup", name: "Startups Research",
      fields: [
        { name: "company", type: "text", required: true },
        { name: "founder", type: "text", required: true },
        { name: "website", type: "url", required: true },
        { name: "funding", type: "text", required: false },
        { name: "linkedin", type: "url", required: false },
        { name: "industry", type: "text", required: false },
      ],
      sourceTypes: ["Startup directories", "Funding databases", "Crunchbase"],
    },
  },
  {
    keywords: ["job", "hiring", "vacancy", "opening", "career", "internship", "recruitment"],
    def: {
      entity: "job listing", name: "Job Openings Research",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "company", type: "text", required: true },
        { name: "salary", type: "text", required: false },
        { name: "location", type: "text", required: false },
        { name: "apply_url", type: "url", required: false },
      ],
      sourceTypes: ["Job boards", "Company career pages"],
      extraFilters: ["Posted: last 30 days"],
    },
  },
  {
    keywords: ["sponsor", "sponsorship", "conference", "event", "summit", "expo", "hackathon"],
    def: {
      entity: "sponsorship opportunity", name: "Sponsorship Opportunities",
      fields: [
        { name: "event", type: "text", required: true },
        { name: "organizer", type: "text", required: true },
        { name: "tier", type: "text", required: false },
        { name: "deadline", type: "text", required: false },
        { name: "website", type: "url", required: false },
      ],
      sourceTypes: ["Event listing sites", "Organizer pages"],
    },
  },
  {
    keywords: ["pricing", "price", "subscription plan", "cost"],
    def: {
      entity: "pricing plan", name: "Pricing Comparison",
      fields: [
        { name: "product", type: "text", required: true },
        { name: "plan", type: "text", required: true },
        { name: "price", type: "text", required: true },
        { name: "features", type: "text", required: false },
      ],
      sourceTypes: ["Vendor pricing pages"],
      extraFilters: ["Category: Software"],
    },
  },
  {
    keywords: ["b2b lead", "sales lead", "prospect", "contact list"],
    def: {
      entity: "sales lead", name: "B2B Sales Leads",
      fields: [
        { name: "company", type: "text", required: true },
        { name: "contact_name", type: "text", required: true },
        { name: "email", type: "text", required: true },
        { name: "linkedin", type: "url", required: false },
        { name: "company_size", type: "text", required: false },
      ],
      sourceTypes: ["LinkedIn public profiles", "Company websites", "Business directories"],
    },
  },
  {
    keywords: ["product", "ecommerce", "amazon", "shopify", "item for sale"],
    def: {
      entity: "product listing", name: "Product Research",
      fields: [
        { name: "product_name", type: "text", required: true },
        { name: "price", type: "text", required: true },
        { name: "rating", type: "number", required: false },
        { name: "reviews", type: "number", required: false },
        { name: "url", type: "url", required: true },
      ],
      sourceTypes: ["E-commerce platforms", "Product review sites"],
    },
  },
  {
    keywords: ["restaurant", "cafe", "dining", "eatery", "hotel"],
    def: {
      entity: "restaurant", name: "Restaurant Research",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "cuisine", type: "text", required: true },
        { name: "rating", type: "number", required: false },
        { name: "address", type: "text", required: false },
        { name: "phone", type: "text", required: false },
      ],
      sourceTypes: ["Google Maps", "Yelp", "Food directories"],
    },
  },
  {
    keywords: ["university", "college", "school", "degree", "mba"],
    def: {
      entity: "educational institution", name: "Education Research",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "program", type: "text", required: true },
        { name: "ranking", type: "number", required: false },
        { name: "website", type: "url", required: false },
        { name: "fees", type: "text", required: false },
      ],
      sourceTypes: ["University websites", "Education portals"],
    },
  },
  {
    keywords: ["news", "article", "blog", "press release"],
    def: {
      entity: "news article", name: "News and Media Research",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "source", type: "text", required: true },
        { name: "date", type: "text", required: true },
        { name: "url", type: "url", required: true },
        { name: "summary", type: "text", required: false },
      ],
      sourceTypes: ["News portals", "Blogs", "Press release sites"],
    },
  },
  {
    keywords: ["real estate", "property", "apartment", "house", "rental", "flat"],
    def: {
      entity: "property listing", name: "Real Estate Research",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "price", type: "text", required: true },
        { name: "location", type: "text", required: true },
        { name: "size", type: "text", required: false },
        { name: "url", type: "url", required: false },
      ],
      sourceTypes: ["Real estate portals", "Property listing sites"],
    },
  },
  {
    keywords: ["company", "business", "firm", "agency", "organization"],
    def: {
      entity: "company", name: "Company Research",
      fields: [
        { name: "company_name", type: "text", required: true },
        { name: "industry", type: "text", required: true },
        { name: "website", type: "url", required: false },
        { name: "size", type: "text", required: false },
        { name: "linkedin", type: "url", required: false },
      ],
      sourceTypes: ["Business directories", "Company websites", "LinkedIn"],
    },
  },
  {
    keywords: ["doctor", "lawyer", "consultant", "researcher", "scientist", "author", "engineer", "expert"],
    def: {
      entity: "professional", name: "Professionals Research",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "affiliation", type: "text", required: false },
        { name: "linkedin", type: "url", required: false },
        { name: "email", type: "text", required: false },
      ],
      sourceTypes: ["LinkedIn", "Professional directories", "Academic sites"],
    },
  },
  {
    keywords: ["freelancer", "designer", "developer", "programmer", "contractor"],
    def: {
      entity: "freelancer", name: "Freelancers Research",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "skill", type: "text", required: true },
        { name: "portfolio_url", type: "url", required: false },
        { name: "rate", type: "text", required: false },
        { name: "location", type: "text", required: false },
      ],
      sourceTypes: ["Freelance platforms", "Portfolio sites"],
    },
  },
];

const LOCATION_MAP: Record<string, string> = {
  india: "Country: India",
  usa: "Country: United States",
  "united states": "Country: United States",
  uk: "Country: United Kingdom",
  "united kingdom": "Country: United Kingdom",
  europe: "Region: Europe",
  global: "Region: Global",
  worldwide: "Region: Global",
  remote: "Remote only",
  online: "Remote only",
  canada: "Country: Canada",
  australia: "Country: Australia",
  germany: "Country: Germany",
  singapore: "Country: Singapore",
};

const NICHE_MAP: Record<string, string> = {
  tech: "Industry: Technology",
  technology: "Industry: Technology",
  finance: "Industry: Finance",
  fintech: "Industry: Fintech",
  health: "Industry: Healthcare",
  healthcare: "Industry: Healthcare",
  education: "Industry: Education",
  edtech: "Industry: EdTech",
  marketing: "Industry: Marketing",
  gaming: "Industry: Gaming",
  crypto: "Industry: Crypto",
  blockchain: "Industry: Blockchain",
  saas: "Category: SaaS",
  "artificial intelligence": "Industry: AI",
  "machine learning": "Industry: ML/AI",
  fashion: "Industry: Fashion",
  travel: "Industry: Travel",
  fitness: "Industry: Fitness",
  beauty: "Industry: Beauty",
};

const FIELD_HINTS: Record<string, DataContract["fields"][0]> = {
  email:       { name: "email", type: "text", required: false },
  website:     { name: "website", type: "url", required: false },
  linkedin:    { name: "linkedin", type: "url", required: false },
  phone:       { name: "phone", type: "text", required: false },
  address:     { name: "address", type: "text", required: false },
  salary:      { name: "salary", type: "text", required: false },
  funding:     { name: "funding", type: "text", required: false },
  rating:      { name: "rating", type: "number", required: false },
  revenue:     { name: "revenue", type: "text", required: false },
  followers:   { name: "followers", type: "number", required: false },
  subscribers: { name: "subscribers", type: "number", required: false },
  contact:     { name: "contact", type: "text", required: false },
  location:    { name: "location", type: "text", required: false },
};

function dedup(arr: string[]): string[] {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
}

export function parsePromptToContract(prompt: string): { name: string; contract: DataContract } {
  const p = prompt.toLowerCase().trim();

  // 1. Target count
  const countMatch = p.match(/\b(\d[\d,]*)\b/);
  const targetCount = countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 100;

  // 2. Location filters
  const locationFilters: string[] = [];
  for (const [key, label] of Object.entries(LOCATION_MAP)) {
    if (p.includes(key)) locationFilters.push(label);
  }

  // 3. Time filters
  const timeFilters: string[] = [];
  const tmMatch = p.match(/last\s+(\d+\s+(?:day|week|month|year)s?)/);
  if (tmMatch) timeFilters.push(`Posted: last ${tmMatch[1]}`);
  const yrMatch = p.match(/\b(20[12]\d)\b/);
  if (yrMatch) timeFilters.push(`Founded after: ${yrMatch[1]}`);

  // 4. Topic filters
  const topicFilters: string[] = [];
  for (const [key, label] of Object.entries(NICHE_MAP)) {
    if (p.includes(key)) topicFilters.push(label);
  }

  // 5. Find best entity match
  let matched: EntityDef | null = null;
  for (const { keywords, def } of ENTITY_MAP) {
    if (keywords.some((kw) => p.includes(kw))) {
      matched = def;
      break;
    }
  }

  if (matched) {
    const existingNames = new Set(matched.fields.map((f) => f.name));
    const extraFields = Object.entries(FIELD_HINTS)
      .filter(([key, f]) => p.includes(key) && !existingNames.has(f.name))
      .map(([, f]) => f);

    return {
      name: matched.name,
      contract: {
        entity: matched.entity,
        fields: [...matched.fields, ...extraFields],
        filters: dedup([...locationFilters, ...timeFilters, ...topicFilters, ...(matched.extraFilters ?? [])]),
        sourceTypes: matched.sourceTypes,
        targetCount,
      },
    };
  }

  // 6. Smart generic fallback
  const nounMatch = p.match(/(?:find|get|collect|scrape|research|list|gather|fetch)\s+(?:\d+\s+)?([a-z][a-z\s]{2,30}?)(?:\s+from|\s+in|\s+with|\s+that|\s+who|$)/);
  const guessedEntity = nounMatch ? nounMatch[1].trim() : prompt.trim().slice(0, 40);
  const capitalized = guessedEntity.charAt(0).toUpperCase() + guessedEntity.slice(1);

  const detectedFields = Object.values(FIELD_HINTS).filter(({ name }) => p.includes(name));
  const baseFields: DataContract["fields"] = detectedFields.length >= 2
    ? detectedFields
    : [
        { name: "name", type: "text", required: true },
        { name: "description", type: "text", required: false },
        { name: "url", type: "url", required: false },
      ];

  return {
    name: `${capitalized} Research`,
    contract: {
      entity: guessedEntity,
      fields: baseFields,
      filters: dedup([...locationFilters, ...timeFilters, ...topicFilters]),
      sourceTypes: ["Public web pages", "Directories"],
      targetCount,
    },
  };
}
