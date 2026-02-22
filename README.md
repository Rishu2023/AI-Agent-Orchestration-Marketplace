# AI Agent Orchestration Marketplace

A full-stack platform for discovering, building, and orchestrating AI agents. Users can browse a marketplace of pre-built agents, create custom agents with a visual builder, compose multi-step workflows, and execute orchestrated pipelines — all through a modern web interface backed by a robust API.

## Features

- **Marketplace** — Browse, search, and review a catalog of AI agents with ratings, versioning, and categorization.
- **Agent Builder** — Create and publish custom agents by defining capabilities, parameters, and metadata.
- **Workflow Orchestration** — Compose multi-step workflows that chain agents together with a visual workflow builder.
- **Execution Engine** — Run workflows end-to-end, track status in real time, and inspect per-step results.
- **Authentication** — Secure user registration and login with JWT-based auth.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Python 3, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| Containerization | Docker, Docker Compose |
| Testing | pytest (34 tests) |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route handlers
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── core/           # Config, security, database setup
│   │   └── main.py         # Application entry point
│   ├── tests/              # pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, Marketplace, AgentDetail, AgentBuilder, WorkflowBuilder
│   │   ├── components/     # Navbar, Footer, AgentCard, SearchBar
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml      # Multi-service orchestration
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
pytest
```

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Log in and receive a JWT |

### Agents (`/api/v1/agents`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/agents` | List / search agents |
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
| POST | `/api/v1/workflows` | Create a workflow |
| GET | `/api/v1/workflows/{id}` | Get workflow details |
| POST | `/api/v1/workflows/{id}/execute` | Execute a workflow |
| GET | `/api/v1/workflows/{id}/executions/{execution_id}` | Check execution status |

## Architecture Overview

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│  Frontend   │──────▶│  Backend   │──────▶│ PostgreSQL │
│  (React)    │ REST  │  (FastAPI) │  ORM  │            │
└────────────┘       └─────┬──────┘       └────────────┘
                           │
                           ▼
                     ┌───────────┐
                     │   Redis   │
                     └───────────┘
```

### Key Backend Services

| Service | Responsibility |
|---------|---------------|
| `agent_service` | CRUD operations and version management for agents |
| `orchestration_service` | Workflow composition, step ordering, and validation |
| `execution_service` | Workflow execution, status tracking, and result aggregation |
| `auth_service` | User registration, login, and JWT token management |

### Data Models

- **User** — account and profile information.
- **Agent / AgentVersion** — agent metadata with semantic versioning.
- **Workflow / WorkflowStep** — multi-step pipeline definitions.
- **WorkflowExecution** — runtime state and results for a workflow run.
- **Review** — user ratings and feedback for agents.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "Add my feature"`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Open a pull request.

Please make sure all existing tests pass (`pytest`) before submitting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.