import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an AI data intelligence assistant. A user describes data they want to collect from the web in plain English.
Your job is to analyze their request and return a structured JSON plan. You MUST return ONLY valid JSON, no markdown, no extra text.

Return this exact structure:
{
  "name": "<short research title, e.g. 'YouTube Fitness Creators'>",
  "entity": "<singular noun for what is being collected, e.g. 'YouTube creator'>",
  "objective": "<one clear sentence describing what will be collected>",
  "fields": [
    { "name": "<field_name_snake_case>", "type": "text|url|number|email", "required": true|false }
  ],
  "filters": ["<filter1>", "<filter2>"],
  "sourceTypes": ["<source1>", "<source2>"],
  "targetCount": <integer, infer from prompt or use 100 as default>,
  "workflowSteps": [
    "Understand requirement",
    "Discover permitted sources",
    "Collect data",
    "Extract fields",
    "Validate records",
    "Remove duplicates",
    "Build dataset"
  ]
}

Rules:
- fields: include 4-7 most relevant fields for this entity type. Always include a name/title field as required.
- filters: include location, niche, time range, or other constraints mentioned (can be empty array).
- sourceTypes: realistic web sources (e.g. "YouTube public pages", "LinkedIn", "Job boards", "Startup directories").
- targetCount: extract number from prompt if mentioned (e.g. "200 startups" -> 200), else default to 100.
- entity: short singular noun phrase (e.g. "job listing", "restaurant", "YouTube creator").
- Be specific and intelligent. Do NOT use generic field names like "name, detail, link".`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 2) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nUser request: "${prompt.trim()}"` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const text = result.response.text().trim();

    // Parse and validate the JSON response
    let parsed: {
      name?: string;
      entity?: string;
      objective?: string;
      fields?: Array<{ name: string; type: string; required: boolean }>;
      filters?: string[];
      sourceTypes?: string[];
      targetCount?: number;
      workflowSteps?: string[];
    };

    try {
      // Strip markdown code fences if present
      const clean = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "");
      parsed = JSON.parse(clean);
    } catch {
      console.error("Gemini returned non-JSON:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Build the DataContract from Gemini output
    const contract = {
      name: parsed.name || "Custom Research",
      entity: parsed.entity || "record",
      objective: parsed.objective || `Collect a dataset of ${parsed.entity || "records"}`,
      fields: (parsed.fields || []).map((f) => ({
        name: f.name,
        type: (["text", "url", "number", "email"].includes(f.type) ? f.type : "text") as "text" | "url" | "number" | "email",
        required: Boolean(f.required),
      })),
      filters: parsed.filters || [],
      sourceTypes: parsed.sourceTypes || ["Public web pages"],
      targetCount: typeof parsed.targetCount === "number" ? parsed.targetCount : 100,
      workflowSteps: parsed.workflowSteps || [
        "Understand requirement",
        "Discover permitted sources",
        "Collect data",
        "Extract fields",
        "Validate records",
        "Remove duplicates",
        "Build dataset",
      ],
    };

    return NextResponse.json({ success: true, contract });
  } catch (err) {
    console.error("Analyze prompt error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
