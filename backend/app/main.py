from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import agents, workflows, auth, federation, protocol, economy, memory, benchmarks, training, research, governance, billing, admin, platform, devices
from app.api.routes import metrics as metrics_route
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.services.meta_agent_service import meta_agent_service
import logging
import redis as redis_lib

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

# Rate limiter middleware
app.add_middleware(RateLimiterMiddleware, max_requests=100, window_seconds=60)

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
app.include_router(federation.router, prefix="/api/v1")
app.include_router(protocol.router, prefix="/api/v1")
app.include_router(economy.router, prefix="/api/v1")
app.include_router(memory.router, prefix="/api/v1")
app.include_router(benchmarks.router, prefix="/api/v1")
app.include_router(training.router, prefix="/api/v1")
app.include_router(research.router, prefix="/api/v1")
app.include_router(governance.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(platform.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")

# Metrics route (root level, not under /api/v1)
app.include_router(metrics_route.router)


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


@app.get("/health/db")
def health_check_db():
    """Check database connectivity."""
    try:
        from app.database.session import engine
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        return {"status": "healthy", "service": "database"}
    except Exception as e:
        return {"status": "unhealthy", "service": "database", "error": str(e)}


@app.get("/health/redis")
def health_check_redis():
    """Check Redis connectivity."""
    try:
        r = redis_lib.from_url(settings.redis_url, socket_connect_timeout=2)
        r.ping()
        return {"status": "healthy", "service": "redis"}
    except Exception as e:
        return {"status": "unhealthy", "service": "redis", "error": str(e)}


@app.get("/health/services")
def health_check_services():
    """Check all services."""
    services = {}

    # Database
    try:
        from app.database.session import engine
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        services["database"] = {"status": "healthy"}
    except Exception as e:
        services["database"] = {"status": "unhealthy", "error": str(e)}

    # Redis
    try:
        r = redis_lib.from_url(settings.redis_url, socket_connect_timeout=2)
        r.ping()
        services["redis"] = {"status": "healthy"}
    except Exception as e:
        services["redis"] = {"status": "unhealthy", "error": str(e)}

    all_healthy = all(s["status"] == "healthy" for s in services.values())
    return {
        "status": "healthy" if all_healthy else "degraded",
        "services": services,
    }
