import "dotenv/config";
import { spawnServer } from "../node_modules/@langchain/langgraph-api/dist/cli/spawn.mjs";
import { createIpcServer } from "../node_modules/@langchain/langgraph-cli/dist/cli/utils/ipc/server.mjs";

async function main() {
  const [pid, server] = await createIpcServer();
  const host = process.env.HOST || "127.0.0.1";
  const port = process.env.PORT || "2024";

  console.log(`Starting LangGraph development server on http://${host}:${port}...`);

  const child = await spawnServer(
    { host, port, nJobsPerWorker: "1", reload: false },
    {
      config: {
        graphs: { agent: "./src/enrichment_agent/graph.ts:graph" },
      },
      env: process.env,
      hostUrl: "https://smith.langchain.com",
    },
    { pid, projectCwd: process.cwd() }
  );

  child.on("error", (err) => console.error("Server error:", err));
  child.on("exit", (code, signal) => {
    console.log(`Server exited with code ${code}, signal ${signal}`);
    process.exit(code || 0);
  });

  process.on("SIGINT", () => {
    child.kill("SIGINT");
    process.exit();
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
    process.exit();
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
