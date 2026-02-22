# AI Agent Orchestration Marketplace

A full-stack platform for discovering, building, and deploying AI agents and multi-agent workflows.

---

## Features

- 🛒 **Marketplace** — Browse, search, and filter published AI agents by category, pricing, and rating
- 🤖 **Agent Builder** — Create and configure AI agents with custom system prompts, tools, and pricing
- 🔀 **Workflow Builder** — Visual drag-and-drop workflow editor using React Flow to chain agents
- 📊 **Dashboard** — Personal dashboard with stats, recent executions, my agents, and my workflows
- 📜 **Execution History** — Full history of agent/workflow runs with token usage and cost tracking
- ⭐ **Reviews & Ratings** — Leave and browse reviews for published agents
- 🔑 **Auth** — JWT-based authentication with API key support
- 🌱 **Seed Data** — Pre-loaded sample agents on startup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | SQLite (dev) / PostgreSQL (prod) via `aiosqlite` / `asyncpg` |
| Frontend | React 18, Vite, Tailwind CSS, React Flow (`@xyflow/react`) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Testing | pytest, pytest-asyncio, HTTPX AsyncClient |
| Container | Docker, Docker Compose, Nginx |

---

## Quick Start with Docker Compose

```bash
# 1. Clone the repo
git clone https://github.com/your-org/AI-Agent-Orchestration-Marketplace.git
cd AI-Agent-Orchestration-Marketplace

# 2. Copy env file
cp .env.example .env

# 3. Build and start
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Running Tests

```bash
cd backend
pytest -v
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/marketplace/agents` | List/search published agents |
| GET | `/api/v1/marketplace/agents/{id}` | Agent detail |
| GET | `/api/v1/marketplace/categories` | List categories |
| GET | `/api/v1/marketplace/featured` | Featured agents |
| POST | `/api/v1/agents` | Create agent |
| PUT | `/api/v1/agents/{id}` | Update agent |
| POST | `/api/v1/agents/{id}/publish` | Toggle publish |
| POST | `/api/v1/agents/{id}/execute` | Execute agent |
| GET | `/api/v1/workflows` | List my workflows |
| POST | `/api/v1/workflows` | Create workflow |
| PUT | `/api/v1/workflows/{id}` | Update workflow |
| POST | `/api/v1/workflows/{id}/execute` | Execute workflow |
| GET | `/api/v1/executions` | Execution history |
| POST | `/api/v1/executions/agents/{id}/run` | Run agent |
| POST | `/api/v1/users/register` | Register |
| POST | `/api/v1/users/login` | Login |
| GET | `/api/v1/users/me` | Current user |
| POST | `/api/v1/users/reviews` | Add review |

Full interactive docs available at `http://localhost:8000/docs`

---

## Demo Credentials

```
Email:    demo@example.com
Password: demo1234
```

---

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app + startup seed
│   ├── config.py            # Settings (pydantic-settings)
│   ├── database.py          # SQLAlchemy async engine
│   ├── auth.py              # JWT + API key auth
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API route handlers
│   └── tests/               # pytest test suite
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, AgentCard, WorkflowNode
│   │   ├── pages/           # Marketplace, AgentDetail, Builder, Dashboard, History
│   │   ├── hooks/           # useApi hook
│   │   └── utils/           # axios instance
│   └── ...
├── docker-compose.yml
├── .env.example
└── README.md
```