import "dotenv/config";
import { graph } from "../src/enrichment_agent/graph.js";

async function main() {
  const topic = process.argv[2] || "Anthropic Claude";
  console.log(`\n========================================`);
  console.log(`Running Data Enrichment Agent`);
  console.log(`Topic: "${topic}"`);
  console.log(`========================================\n`);

  if (!process.env.TAVILY_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log("ℹ️  Note: Ensure you have configured your API keys in .env (e.g., TAVILY_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY)");
  }

  const extractionSchema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Summary of the entity or topic.",
      },
      key_features: {
        type: "array",
        items: { type: "string" },
        description: "Key features, facts, or capabilities.",
      },
      primary_website: {
        type: "string",
        description: "Primary official website or documentation URL.",
      },
    },
    required: ["summary", "key_features"],
  };

  try {
    const res = await graph.invoke({
      topic,
      extractionSchema,
    });

    console.log("\n Enriched Information Result:");
    console.log(JSON.stringify(res.info, null, 2));
  } catch (error: any) {
    console.error("\n❌ Execution error:", error?.message || error);
    if (error?.message?.includes("API key") || error?.message?.includes("401") || error?.message?.includes("apiKey")) {
      console.log("\n💡 Tip: Please check your API keys in your .env file.");
    }
  }
}

main();
