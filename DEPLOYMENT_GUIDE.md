# 🚀 PirateAgent — Production Deployment Guide

Deploy **PirateAgent** to production across:
1. **Aiven** → Cloud MySQL 8.4 Database (SSL Required)
2. **Render** → Spring Boot Orchestration Backend (`:8080`) & LangGraph Agent Engine (`:2024`)
3. **Vercel** → Next.js 14 Modern Mission Control Frontend (`:3000`)

---

## 🏗️ Architecture & Deployment Flow

```
                      ┌────────────────────────────────────────┐
                      │          Vercel Edge Network           │
                      │   PirateAgentUI (Next.js 14 App)       │
                      │  https://pirateagent.vercel.app        │
                      └──────────────────┬─────────────────────┘
                                         │  HTTPS / API Rewrites
                                         ▼
                      ┌────────────────────────────────────────┐
                      │             Render Cloud               │
                      │  pirate-backend (Spring Boot 3.3.4)    │
                      │  Port 8080                             │
                      └────────────┬──────────────┬────────────┘
                                   │              │
                   Internal/Public │              │ MySQL SSL
                   HTTP REST       │              │ (Port 17242)
                                   ▼              ▼
     ┌───────────────────────────────────┐  ┌───────────────────────────────────┐
     │           Render Cloud            │  │          Aiven Cloud              │
     │   pirate-langgraph (Agent Engine) │  │       Managed MySQL 8.4           │
     │   Port 2024                       │  │   mysql-15844dec...               │
     └───────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 📋 Comprehensive Environment Variables Checklist

### 1. Render — Service 1: `pirate-langgraph` (Node 20 / LangGraph)
| Key | Required / Optional | Value / Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | **Required** | `2024` | `2024` |
| `HOST` | **Required** | `0.0.0.0` | `0.0.0.0` |
| `GOOGLE_API_KEY` | **Required** | Google Gemini API Key | `AQ.Ab8...` |
| `GEMINI_API_KEY` | **Required** | Same as GOOGLE_API_KEY | `AQ.Ab8...` |
| `TAVILY_API_KEY` | **Required** | Tavily Intelligence Search API Key | `tvly-dev-...` |
| `LANGCHAIN_PROJECT` | Optional | Project tracing name | `data-enrichment` |

---

### 2. Render — Service 2: `pirate-backend` (Java 21 / Spring Boot)
| Key | Required / Optional | Value / Description | Example (From Your Aiven Instance) |
| :--- | :--- | :--- | :--- |
| `PORT` | **Required** | `8080` | `8080` |
| `SPRING_PROFILES_ACTIVE` | **Required** | Spring production profile | `prod` |
| `DB_HOST` | **Required** | Aiven MySQL Host | `mysql-15844dec-krishnaronaldo12op-f13d.l.aivencloud.com` |
| `DB_PORT` | **Required** | Aiven MySQL Port | `17242` |
| `DB_NAME` | **Required** | Aiven Database Name | `defaultdb` |
| `DB_USER` | **Required** | Aiven Database User | `avnadmin` |
| `DB_PASSWORD` | **Required** | Aiven Database Password | `<YOUR_AIVEN_PASSWORD>` |
| `GEMINI_API_KEY` | **Required** | Google Gemini API Key | `AQ.Ab8...` |
| `TAVILY_API_KEY` | **Required** | Tavily Search API Key | `tvly-dev-...` |
| `LANGGRAPH_BASE_URL` | **Required** | URL of Render Service 1 | `https://pirate-langgraph.onrender.com` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Optional | Auto-create tables (default: `update`) | `update` |

> [!NOTE]
> `application-prod.properties` automatically enables SSL (`useSSL=true&requireSSL=true&verifyServerCertificate=false`), which satisfies Aiven's `SSL mode: REQUIRED` without needing manual certificate management.

---

### 3. Vercel — `PirateAgentUI` (Next.js 14 Frontend)
| Key | Required / Optional | Value / Description | Example |
| :--- | :--- | :--- | :--- |
| `BACKEND_URL` | **Required** | Public Render URL of `pirate-backend` | `https://pirate-backend.onrender.com` |
| `NEXT_PUBLIC_API_URL` | **Required** | Same as BACKEND_URL | `https://pirate-backend.onrender.com` |
| `GEMINI_API_KEY` | **Required** | Gemini Key for client prompt planner | `AQ.Ab8...` |

---

## 🛠️ Step-by-Step Deployment Walkthrough

### Step 1: Push Latest Changes to GitHub

Ensure all deployment configurations (`Dockerfile`, `backend/Dockerfile`, `render.yaml`, `vercel.json`) are committed to GitHub:

```bash
git add .
git commit -m "feat(deploy): add Render Dockerfiles, render.yaml, vercel.json, and Aiven MySQL configs"
git push origin main
```

---

### Step 2: Verify Aiven MySQL (Already Active)
Your Aiven MySQL instance `mysql-15844dec` is already active and running:
- **Host**: `mysql-15844dec-krishnaronaldo12op-f13d.l.aivencloud.com`
- **Port**: `17242`
- **Database**: `defaultdb`
- **User**: `avnadmin`
- **Password**: `<Your Aiven Password from Console>`
- **SSL**: `REQUIRED` (Handled automatically by the Spring Boot connection string)

> [!TIP]
> Hibernate is configured with `ddl-auto=update`. All 5 tables (`intelligence_tasks`, `datasets`, `dataset_records`, `source_citations`, `task_logs`) will be automatically created on the first start of Spring Boot.

---

### Step 3: Deploy Backend Services to Render

You can deploy on Render using **Method A (Render Blueprint)** or **Method B (Manual Web Services)**.

#### Method A: 1-Click Render Blueprint (Recommended)
1. In your Render Dashboard, click **Blueprints** on the left menu (or click **+ New** > **Blueprint**).
2. Connect your GitHub repository: `VishalRajExe/PirateAgent`.
3. Render will read [render.yaml](file:///c:/Users/visha/Downloads/data-enrichment-js-main/render.yaml) and automatically create both services:
   - `pirate-langgraph`
   - `pirate-backend`
4. Enter the required environment variable values when prompted (API keys and Aiven DB credentials).
5. Click **Apply**.

---

#### Method B: Manual Service Creation on Render

If you prefer to create them manually:

##### 1. Create `pirate-langgraph` Web Service:
1. Click **+ New** > **Web Service**.
2. Select **Build and deploy from a Git repository** > Connect `VishalRajExe/PirateAgent`.
3. Fill in the fields:
   - **Name**: `pirate-langgraph`
   - **Region**: Choose closest to Aiven (e.g., `Frankfurt` or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type**: Free or Starter
4. Under **Environment Variables**, add:
   - `PORT` = `2024`
   - `HOST` = `0.0.0.0`
   - `GOOGLE_API_KEY` = `<Your Gemini API Key>`
   - `GEMINI_API_KEY` = `<Your Gemini API Key>`
   - `TAVILY_API_KEY` = `<Your Tavily API Key>`
5. Click **Create Web Service**.
6. Once deployed, copy your service URL: `https://pirate-langgraph-xxxx.onrender.com`.

---

##### 2. Create `pirate-backend` Web Service:
1. Click **+ New** > **Web Service**.
2. Select your repository `VishalRajExe/PirateAgent`.
3. Fill in the fields:
   - **Name**: `pirate-backend`
   - **Region**: Same region as `pirate-langgraph`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./Dockerfile` (or `./backend/Dockerfile` if Root Directory is left empty)
   - **Docker Context**: `backend` (or `.` if relative to root)
   - **Instance Type**: Starter (requires at least 512MB RAM for Java 21)
4. Under **Health Check Path**: enter `/api/health`.
5. Under **Environment Variables**, add:
   - `PORT` = `8080`
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DB_HOST` = `mysql-15844dec-krishnaronaldo12op-f13d.l.aivencloud.com`
   - `DB_PORT` = `17242`
   - `DB_NAME` = `defaultdb`
   - `DB_USER` = `avnadmin`
   - `DB_PASSWORD` = `<Your Aiven Password>`
   - `GEMINI_API_KEY` = `<Your Gemini API Key>`
   - `TAVILY_API_KEY` = `<Your Tavily API Key>`
   - `LANGGRAPH_BASE_URL` = `https://pirate-langgraph-xxxx.onrender.com` (from Service 1)
6. Click **Create Web Service**.
7. Once deployed, verify by opening `https://pirate-backend-xxxx.onrender.com/api/health` in your browser. You should receive:
   ```json
   {"version":"1.0.0","status":"UP","backend":"Spring Boot 3.3.4 (Java 21)","service":"AI Data Intelligence Platform"}
   ```
8. Copy your backend service URL: `https://pirate-backend-xxxx.onrender.com`.

---

### Step 4: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `VishalRajExe/PirateAgent`.
4. In the Project Configuration screen:
   - **Project Name**: `pirateagent`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `PirateAgentUI` ⚠️ *(Critical: do not leave as repository root!)*
5. Expand **Environment Variables** and add:
   - `BACKEND_URL` = `https://pirate-backend-xxxx.onrender.com`
   - `NEXT_PUBLIC_API_URL` = `https://pirate-backend-xxxx.onrender.com`
   - `GEMINI_API_KEY` = `<Your Gemini Key>`
6. Click **Deploy**.
7. Vercel will build and deploy the Next.js application in ~60 seconds.

---

## 🧪 Post-Deployment Verification

1. **Verify Backend Health**:
   ```bash
   curl https://pirate-backend-xxxx.onrender.com/api/health
   # Returns: {"version":"1.0.0","status":"UP",...}
   ```

2. **Verify LangGraph Agent Health**:
   ```bash
   curl https://pirate-langgraph-xxxx.onrender.com/ok
   # Returns: {"ok":true}
   ```

3. **Verify Mission Control UI**:
   - Open your Vercel URL: `https://pirateagent.vercel.app`
   - Navigate to `/dashboard/research/new`
   - Enter a prompt: *"Find Indian SaaS startups with founder and funding"*
   - Click **Generate Autonomous Plan**
   - Click **Launch AI Agent**
   - Observe live progress: Planning ➔ Web Search ➔ Field Extraction ➔ Validation ➔ MySQL Storage
   - Navigate to `/dashboard/datasets` to verify that your data persists in Aiven MySQL!
