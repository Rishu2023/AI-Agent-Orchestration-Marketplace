from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import agents, workflows, auth
from app.services.meta_agent_service import meta_agent_service
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting meta-agent background evaluation scheduler")
    meta_agent_service.start_background_evaluation(agents=[])
    yield
    meta_agent_service.stop_scheduled_evaluation()
    logger.info("Stopped meta-agent evaluation scheduler")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="The definitive marketplace and orchestration platform for AI agents. "
    "Discover, deploy, and coordinate AI agents to accomplish complex tasks.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(workflows.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
