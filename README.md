# AI Agent Orchestration Marketplace

A full-stack platform for discovering, building, and orchestrating AI agents. Users can browse a marketplace of pre-built agents, create custom agents with a visual builder, compose multi-step workflows, and execute orchestrated pipelines — all through a modern web interface backed by a robust API.

## Features

- **Marketplace** — Browse, search, and review a catalog of AI agents with ratings, versioning, and categorization.
- **Agent Builder** — Create and publish custom agents by defining capabilities, parameters, and metadata.
- **Workflow Orchestration** — Compose multi-step workflows that chain agents together with a visual workflow builder.
- **Execution Engine** — Run workflows end-to-end, track status in real time, and inspect per-step results.
- **Authentication** — Secure user registration and login with JWT-based auth.
- **Federation** — Federate agents across multiple nodes with heartbeat synchronization.
- **Agent Protocol** — Standardized inter-agent communication protocol with message passing.
- **Token Economy** — Credit-based economy with transactions, balance tracking, and leaderboards.
- **Memory & Knowledge** — Persistent agent memory and vector-based knowledge search.
- **Benchmarks** — Run model benchmarks with leaderboard and historical comparison.
- **Training** — Create and manage fine-tuning training jobs and publish models.
- **Research** — Scan and track AI research papers, trending topics, and auto-generated agents.
- **Governance** — Community proposals, voting system, and veto capabilities.
- **Billing** — API key management, subscription plans, and usage tracking.
- **Admin** — User management, kill switches, announcements, and audit logging.
- **Platform Analytics** — Real-time platform statistics and historical metrics.
- **Metrics & Monitoring** — Prometheus-compatible metrics endpoint for observability.
- **Rate Limiting** — Configurable per-IP rate limiting middleware.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Python 3, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| Vector Store | ChromaDB |
| Containerization | Docker, Docker Compose |
| Testing | pytest |

## Architecture Overview

```
┌────────────┐       ┌────────────────┐       ┌────────────┐
│  Frontend   │──────▶│    Backend     │──────▶│ PostgreSQL │
│  (React)    │ REST  │   (FastAPI)    │  ORM  │            │
└────────────┘       └──┬──────┬──────┘       └────────────┘
                        │      │
                        ▼      ▼
                  ┌────────┐ ┌──────────┐
                  │ Redis  │ │ ChromaDB │
                  └────────┘ └──────────┘
```

### Key Backend Services

| Service | Responsibility |
|---------|---------------|
| `agent_service` | CRUD operations and version management for agents |
| `orchestration_service` | Workflow composition, step ordering, and validation |
| `execution_service` | Workflow execution, status tracking, and result aggregation |
| `auth_service` | User registration, login, and JWT token management |
| `federation_service` | Cross-node agent federation and synchronization |
| `economy_service` | Credit-based token economy and transactions |
| `memory_service` | Agent memory persistence and knowledge retrieval |
| `benchmark_service` | Model benchmarking and leaderboard management |
| `training_service` | Fine-tuning job management and model publishing |
| `research_service` | Research paper scanning and trend analysis |
| `governance_service` | Proposal management and community voting |
| `billing_service` | API keys, subscriptions, and usage metering |
| `meta_agent_service` | Background agent evaluation and scheduling |

### Data Models

- **User** — Account and profile information.
- **Agent / AgentVersion** — Agent metadata with semantic versioning.
- **Workflow / WorkflowStep** — Multi-step pipeline definitions.
- **WorkflowExecution** — Runtime state and results for a workflow run.
- **Review** — User ratings and feedback for agents.
- **FederationNode** — Federated node registry.
- **Transaction** — Credit economy transaction records.
- **Memory** — Persistent agent memory entries.
- **Proposal / Vote** — Governance proposals and votes.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers (15 modules)
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic layer
│   │   ├── middleware/        # Rate limiting middleware
│   │   ├── database/         # Database session and connection pooling
│   │   ├── config.py         # Application configuration
│   │   └── main.py           # Application entry point
│   ├── tests/                # pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # Home, Marketplace, AgentDetail, AgentBuilder, WorkflowBuilder
│   │   ├── components/       # Navbar, Footer, AgentCard, SearchBar
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml        # Multi-service orchestration
├── vercel.json               # Vercel frontend deployment config
├── render.yaml               # Render backend deployment config
└── README.md
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Alternatively: Python 3.10+, Node.js 18+, PostgreSQL, Redis

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/<owner>/AI-Agent-Orchestration-Marketplace.git
cd AI-Agent-Orchestration-Marketplace

# Start all services
docker-compose up --build
```

The frontend is served at **http://localhost:3000** and the API at **http://localhost:8000**.

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
cd backend
TESTING=1 pytest
```

## API Endpoints

### System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Application info |
| GET | `/health` | Health check |
| GET | `/health/db` | Database connectivity check |
| GET | `/health/redis` | Redis connectivity check |
| GET | `/health/services` | All services health check |
| GET | `/metrics` | Prometheus-compatible metrics |

### Authentication (`/api/v1/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Log in and receive a JWT |

### Agents (`/api/v1/agents`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/agents` | List / search agents |
| GET | `/api/v1/agents/featured` | Get featured agents |
| GET | `/api/v1/agents/popular` | Get popular agents |
| GET | `/api/v1/agents/trending` | Get trending agents |
| GET | `/api/v1/agents/leaderboard` | Agent leaderboard |
| POST | `/api/v1/agents` | Create a new agent |
| GET | `/api/v1/agents/{id}` | Get agent details |
| PUT | `/api/v1/agents/{id}` | Update an agent |
| DELETE | `/api/v1/agents/{id}` | Delete an agent |
| POST | `/api/v1/agents/{id}/publish` | Publish an agent |
| POST | `/api/v1/agents/{id}/execute` | Execute an agent |

### Workflows (`/api/v1/workflows`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/workflows` | List workflows |
| GET | `/api/v1/workflows/templates` | List workflow templates |
| POST | `/api/v1/workflows` | Create a workflow |
| GET | `/api/v1/workflows/{id}` | Get workflow details |
| PUT | `/api/v1/workflows/{id}` | Update a workflow |
| DELETE | `/api/v1/workflows/{id}` | Delete a workflow |
| POST | `/api/v1/workflows/{id}/execute` | Execute a workflow |
| GET | `/api/v1/workflows/{id}/executions/{eid}` | Check execution status |

### Federation (`/api/v1/federation`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/federation/nodes` | Register a federation node |
| GET | `/api/v1/federation/nodes` | List federation nodes |
| POST | `/api/v1/federation/nodes/{id}/sync` | Sync a node |
| POST | `/api/v1/federation/nodes/{id}/heartbeat` | Send heartbeat |
| DELETE | `/api/v1/federation/nodes/{id}` | Remove a node |
| GET | `/api/v1/federation/agents` | List federated agents |

### Protocol (`/api/v1/protocol`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/protocol/version` | Get protocol version |
| GET | `/api/v1/protocol/spec` | Get protocol specification |
| POST | `/api/v1/protocol/messages` | Send a protocol message |
| GET | `/api/v1/protocol/messages/{agent_id}` | Get agent messages |

### Economy (`/api/v1/economy`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/economy/balance/{user_id}` | Get user credit balance |
| GET | `/api/v1/economy/transactions/{user_id}` | Get user transactions |
| POST | `/api/v1/economy/credits/add` | Add credits |
| POST | `/api/v1/economy/credits/spend` | Spend credits |
| GET | `/api/v1/economy/leaderboard` | Economy leaderboard |

### Memory (`/api/v1/memory`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/memory/store` | Store a memory entry |
| GET | `/api/v1/memory/knowledge/search` | Search knowledge base |
| POST | `/api/v1/memory/knowledge` | Add knowledge entry |
| GET | `/api/v1/memory/{agent_id}/stats` | Get agent memory stats |
| GET | `/api/v1/memory/{agent_id}/search` | Search agent memory |
| GET | `/api/v1/memory/{agent_id}` | Get agent memories |
| PUT | `/api/v1/memory/{memory_id}` | Update a memory entry |
| DELETE | `/api/v1/memory/{memory_id}` | Delete a memory entry |

### Benchmarks (`/api/v1/benchmarks`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/benchmarks/run` | Run a benchmark |
| GET | `/api/v1/benchmarks/leaderboard` | Benchmark leaderboard |
| GET | `/api/v1/benchmarks/compare` | Compare benchmark results |
| GET | `/api/v1/benchmarks/history/{model}` | Get model benchmark history |

### Training (`/api/v1/training`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/training/jobs` | Create a training job |
| POST | `/api/v1/training/jobs/{id}/start` | Start a training job |
| GET | `/api/v1/training/jobs/{id}` | Get training job details |
| GET | `/api/v1/training/jobs` | List training jobs |
| GET | `/api/v1/training/models` | List trained models |
| POST | `/api/v1/training/models/{id}/publish` | Publish a trained model |

### Research (`/api/v1/research`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/research/papers` | List research papers |
| GET | `/api/v1/research/papers/{id}` | Get paper details |
| POST | `/api/v1/research/scan` | Scan for new papers |
| GET | `/api/v1/research/trending` | Get trending research topics |
| GET | `/api/v1/research/auto-agents` | Get auto-generated agents |

### Governance (`/api/v1/governance`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/governance/proposals` | Create a proposal |
| GET | `/api/v1/governance/proposals` | List proposals |
| GET | `/api/v1/governance/proposals/{id}` | Get proposal details |
| POST | `/api/v1/governance/proposals/{id}/vote` | Vote on a proposal |
| POST | `/api/v1/governance/proposals/{id}/veto` | Veto a proposal |
| GET | `/api/v1/governance/proposals/{id}/results` | Get voting results |

### Billing (`/api/v1/billing`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/billing/api-keys` | Create an API key |
| GET | `/api/v1/billing/api-keys/{user_id}` | List user API keys |
| DELETE | `/api/v1/billing/api-keys/{key_id}` | Revoke an API key |
| GET | `/api/v1/billing/plans` | List subscription plans |
| POST | `/api/v1/billing/subscribe` | Subscribe to a plan |
| GET | `/api/v1/billing/subscription/{user_id}` | Get user subscription |
| GET | `/api/v1/billing/usage/{user_id}` | Get user usage stats |

### Admin (`/api/v1/admin`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/users` | List users |
| POST | `/api/v1/admin/users/{id}/ban` | Ban a user |
| POST | `/api/v1/admin/users/{id}/unban` | Unban a user |
| DELETE | `/api/v1/admin/agents/{id}` | Remove an agent |
| POST | `/api/v1/admin/credits/adjust` | Adjust user credits |
| POST | `/api/v1/admin/announcements` | Create announcement |
| GET | `/api/v1/admin/announcements` | List announcements |
| POST | `/api/v1/admin/kill-switch` | Activate kill switch |
| DELETE | `/api/v1/admin/kill-switch/{id}` | Deactivate kill switch |
| GET | `/api/v1/admin/audit-log` | View audit log |

### Platform (`/api/v1/platform`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/platform/stats` | Get platform statistics |
| GET | `/api/v1/platform/stats/history` | Get historical stats |

## Deployment

### Free-Tier Deployment Guide

Deploy the full stack at zero cost using free tiers of popular cloud services.

#### 1. Database — Supabase (Free Tier PostgreSQL)

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project and note the **connection string** from Settings → Database.
3. The connection string format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

#### 2. Redis — Upstash (Free Tier)

1. Create a free account at [upstash.com](https://upstash.com).
2. Create a new Redis database.
3. Copy the **Redis URL** from the dashboard (format: `rediss://default:[PASSWORD]@[HOST]:6379`).

#### 3. Backend — Render.com (Free Tier)

1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub repository.
3. Create a new **Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL` — Supabase connection string from step 1
   - `REDIS_URL` — Upstash Redis URL from step 2
   - `SECRET_KEY` — Generate a secure random string
5. Alternatively, use the included `render.yaml` for blueprint deployment.

#### 4. Frontend — Vercel (Free Tier)

1. Create a free account at [vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Vercel auto-detects the `vercel.json` configuration:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Framework**: Vite
4. Add environment variable:
   - `VITE_API_URL` — Your Render backend URL (e.g., `https://ai-marketplace-backend.onrender.com`)
5. Deploy.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `SECRET_KEY` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |
| `MISTRAL_API_KEY` | Mistral API key | No |
| `GROQ_API_KEY` | Groq API key | No |
| `OLLAMA_BASE_URL` | Ollama server URL | No |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No |
| `CHROMA_HOST` | ChromaDB host (default: localhost) | No |
| `CHROMA_PORT` | ChromaDB port (default: 8000) | No |

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "Add my feature"`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Open a pull request.

Please make sure all existing tests pass (`pytest`) before submitting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.