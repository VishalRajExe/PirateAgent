import "dotenv/config";
import http from "node:http";
import { spawnServer } from "../node_modules/@langchain/langgraph-api/dist/cli/spawn.mjs";
import { createIpcServer } from "../node_modules/@langchain/langgraph-cli/dist/cli/utils/ipc/server.mjs";

const LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PirateAgent — LangGraph Agentic Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #0f172a;
      --card-border: rgba(148, 163, 184, 0.12);
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #d97706;
      --cyan: #06b6d4;
      --green: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background-image: 
        radial-gradient(circle at 50% 10%, rgba(217, 119, 6, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
    }
    .container {
      max-width: 680px;
      width: 100%;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.6rem;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.55;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      margin-bottom: 1.5rem;
    }
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      margin-bottom: 1.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(217, 119, 6, 0.5);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 0.9rem;
    }
    .info-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
    }
    .info-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #38bdf8;
    }
    .routes-list {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .route-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }
    .method {
      color: #10b981;
      font-weight: 700;
    }
    .route-path {
      color: #e2e8f0;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span class="pulse-dot"></span>
      LangGraph Agent Engine Online
    </div>
    <h1>🏴‍☠️ PirateAgent LangGraph Engine</h1>
    <p class="subtitle">
      Backend agent orchestration server hosting LangGraph multi-agent workflows, search nodes, and data enrichment graphs.
    </p>

    <div class="card">
      <div class="btn-row">
        <a href="https://smith.langchain.com/studio?baseUrl=http://127.0.0.1:2024" target="_blank" class="btn btn-primary">
          🎨 Open LangGraph Studio
        </a>
        <a href="http://localhost:3000/dashboard" target="_blank" class="btn btn-secondary">
          🧭 PirateAgent Mission Control (3000)
        </a>
        <a href="/ok" class="btn btn-secondary">
          🩺 Health Check (/ok)
        </a>
      </div>

      <div class="grid">
        <div class="info-box">
          <div class="info-label">Active Graph</div>
          <div class="info-value">agent</div>
        </div>
        <div class="info-box">
          <div class="info-label">Graph Entrypoint</div>
          <div class="info-value">enrichment_agent/graph.ts</div>
        </div>
        <div class="info-box">
          <div class="info-label">API Port</div>
          <div class="info-value">127.0.0.1:2024</div>
        </div>
        <div class="info-box">
          <div class="info-label">Studio Host</div>
          <div class="info-value">smith.langchain.com</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <div class="info-label">Available API Endpoints</div>
        <div class="routes-list">
          <div class="route-item">
            <span class="route-path"><span class="method">GET</span> /ok</span>
            <span style="color: #64748b;">Health Status (200 OK)</span>
          </div>
          <div class="route-item">
            <span class="route-path"><span class="method">POST</span> /threads</span>
            <span style="color: #64748b;">Create Run Thread</span>
          </div>
          <div class="route-item">
            <span class="route-path"><span class="method">POST</span> /threads/{id}/runs/stream</span>
            <span style="color: #64748b;">SSE Event Stream</span>
          </div>
          <div class="route-item">
            <span class="route-path"><span class="method">GET</span> /threads/{id}/state</span>
            <span style="color: #64748b;">Inspect Agent State</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      PirateAgent &bull; AI-Powered Data Intelligence &bull; LangGraph JS 1.4+
    </div>
  </div>
</body>
</html>`;

async function main() {
  const [pid] = await createIpcServer();
  const internalHost = "127.0.0.1";
  const publicHost = process.env.HOST || "0.0.0.0";
  const publicPort = parseInt(process.env.PORT || "2024", 10);
  const internalPort = publicPort + 1; // 2025

  console.log(`Starting LangGraph internal server on http://${internalHost}:${internalPort}...`);

  const child = await spawnServer(
    { host: internalHost, port: String(internalPort), nJobsPerWorker: "1", reload: false },
    {
      config: {
        graphs: { agent: "./src/enrichment_agent/graph.ts:graph" },
      },
      env: process.env,
      hostUrl: "https://smith.langchain.com",
    },
    { pid, projectCwd: process.cwd() }
  );

  child.on("error", (err) => console.error("Internal server error:", err));
  child.on("exit", (code, signal) => {
    console.log(`Internal server exited with code ${code}, signal ${signal}`);
    process.exit(code || 0);
  });

  // Create public gateway server on publicPort
  const gateway = http.createServer((req, res) => {
    const urlPath = req.url?.split("?")[0] || "/";

    // When hitting root '/', serve the friendly landing page instead of 404
    if (urlPath === "/" || urlPath === "") {
      const accept = req.headers.accept || "";
      if (accept.includes("application/json")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            service: "PirateAgent LangGraph Agent Engine",
            graph: "agent",
            studio_url: `https://smith.langchain.com/studio?baseUrl=http://${publicHost === "0.0.0.0" ? "127.0.0.1" : publicHost}:${publicPort}`,
            health_url: `http://${publicHost === "0.0.0.0" ? "127.0.0.1" : publicHost}:${publicPort}/ok`,
          })
        );
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(LANDING_PAGE_HTML);
      return;
    }

    // Proxy all other routes (/ok, /threads, /runs, /docs, etc.) to internal LangGraph
    const proxyReq = http.request(
      {
        host: internalHost,
        port: internalPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(`Bad Gateway: LangGraph internal server error: ${err.message}`);
    });

    req.pipe(proxyReq, { end: true });
  });

  // Support WebSockets proxying
  gateway.on("upgrade", (req, socket, head) => {
    const proxyReq = http.request({
      host: internalHost,
      port: internalPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    });
    proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
      socket.write(
        `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n` +
          Object.entries(proxyRes.headers)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}\r\n`)
            .join("") +
          "\r\n"
      );
      if (proxyHead && proxyHead.length) socket.write(proxyHead);
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });
    proxyReq.on("error", () => socket.destroy());
    proxyReq.end();
  });

  gateway.listen(publicPort, publicHost, () => {
    console.log(`🚀 LangGraph gateway ready at http://${publicHost}:${publicPort}`);
    console.log(`🎨 Studio UI: https://smith.langchain.com/studio?baseUrl=http://${publicHost === "0.0.0.0" ? "127.0.0.1" : publicHost}:${publicPort}`);
  });

  const cleanup = () => {
    gateway.close();
    child.kill("SIGTERM");
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
