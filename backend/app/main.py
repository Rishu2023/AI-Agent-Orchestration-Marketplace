from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import agents, workflows, auth, federation, protocol, economy, memory, benchmarks, training, research, governance, billing, admin, platform, devices
from app.api.routes import metrics as metrics_route
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.security import SecurityHeadersMiddleware, BruteForceProtectionMiddleware
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

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Brute force protection middleware
app.add_middleware(BruteForceProtectionMiddleware, max_attempts=5, lockout_seconds=900)

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


@app.get("/api/v1/security/health")
def security_health():
    """Check for common security misconfigurations."""
    checks = {}

    checks["jwt_secret_configured"] = {
        "status": "pass" if settings.secret_key and settings.secret_key != "your-secret-key-change-in-production" else "fail",
        "detail": "JWT secret key is properly configured" if settings.secret_key and settings.secret_key != "your-secret-key-change-in-production" else "JWT secret key is using default value",
    }

    checks["debug_mode"] = {
        "status": "pass" if not settings.debug else "warning",
        "detail": "Debug mode is disabled" if not settings.debug else "Debug mode is enabled - disable in production",
    }

    checks["cors_configuration"] = {
        "status": "info",
        "detail": "CORS is configured for local development origins",
    }

    checks["rate_limiting"] = {
        "status": "pass",
        "detail": "Rate limiting middleware is active (100 req/60s)",
    }

    checks["brute_force_protection"] = {
        "status": "pass",
        "detail": "Login brute force protection is active (5 attempts, 15min lockout)",
    }

    checks["security_headers"] = {
        "status": "pass",
        "detail": "CSP, X-Frame-Options, X-Content-Type-Options headers are set",
    }

    all_pass = all(c["status"] in ("pass", "info") for c in checks.values())
    return {
        "status": "secure" if all_pass else "review_needed",
        "checks": checks,
    }
