# AI Workforce Platform | Multi-Agent Automation & n8n Canvas Studio

> **Claude Light Theme** • Indic Voice Code-Switching • MongoDB Integration • Multi-Agent Orchestration

The **AI Workforce Platform** converts plain-language business requirements into a generated team of narrow AI workers (Manager Router + Specialist Workers). It features an n8n-style visual workflow editor, MongoDB document node integration, interactive execution simulator, and human escalation handoff inbox.

---

## 🚀 Quick Start & Execution Commands

### 1. Prerequisites
- **Python 3.10+** (for FastAPI backend)
- **Node.js 18+** & **npm** (for Next.js frontend)
- *(Optional)* **MongoDB** running locally on `mongodb://localhost:27017` or via `MONGO_URI` environment variable. *(Note: If MongoDB is not running, the backend automatically uses in-memory persistence).*

---

### 🐍 Backend Execution (FastAPI & MongoDB)

Navigate to the `backend` directory and start the Uvicorn server:

```bash
cd backend

# Sync dependencies using uv
uv sync

# Run the FastAPI backend server using uv
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Backend API Base URL**: `http://localhost:8000`
- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/health`

---

### 💻 Frontend Execution (Next.js & Claude Light Theme UI)

In a separate terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install Node dependencies (if first time)
npm install

# Start the Next.js development server
npm run dev
```

- **Frontend App URL**: `http://localhost:3000`

> 💡 **Troubleshooting Port Conflicts**:
> If port `3000` is already in use by a previous process, kill it in Windows PowerShell with:
> ```powershell
> taskkill /PID <PID_NUMBER> /F
> ```
> Or start Next.js on a different port:
> ```bash
> npm run dev -- -p 3001
> ```

---

### 🌐 Standalone HTML Prototype

You can also open the standalone interactive visual studio directly in any web browser without starting a dev server:
- `AI Workforce Builder (n8n Claude Light).html`
- `n8n_claude_light_workflow_studio.html`

---

## 🌟 Key Application Features

1. **🏡 Home / Landing Page**: Product architecture overview, requirement intake demo, feature pills.
2. **🔑 Auth & 6-Digit OTP Verification**: Login, Signup, Forgot Password with 6-digit OTP code verification modal.
3. **📁 Projects & Workspace Dashboard**: KPI stat cards, recent projects list, active run indicators, and **New Project Creation Modal**.
4. **⚡ Visual Workflow Editor Canvas**: n8n-inspired dot matrix grid canvas, SVG Bézier connection wires, and node drag-and-drop.
5. **🗄️ Database & Vector Nodes**: MongoDB Query/Insert, PostgreSQL & pgvector, Redis Stream, Pinecone Vector DB, Webhooks, Google Sheets, Claude 3.7 Sonnet, Groq LLM, Gmail, Slack.
6. **🔍 Node Search & Add Modal**: Live catalog search by category (*AI & Reasoning*, *Database & Vector*, *Triggers & Intake*, *Tools & Actions*).
7. **⚙️ Node Inspector Parameter Drawer**: System instructions editor, model selector, input MongoDB JSON schema, output preview, and step test execution.
8. **📜 Executions Session Log & Trace**: Historical runs list, duration, status badges, and step-by-step node execution trace inspector.
9. **🚨 Human Handoff Escalation Inbox**: Pending human escalations with full transcript, photo attachment, and one-click takeover/resolve buttons.
