import time
from fastapi import APIRouter, Request
from starlette.responses import PlainTextResponse

router = APIRouter(tags=["metrics"])

# Simple in-memory counters
_metrics = {
    "total_requests": 0,
    "active_requests": 0,
    "request_latency_seconds_sum": 0.0,
    "request_latency_seconds_count": 0,
    "db_connections_active": 0,
}


def increment_request_metrics():
    """Increment total and active request counters."""
    _metrics["total_requests"] += 1
    _metrics["active_requests"] += 1


def decrement_active_requests():
    """Decrement active request counter."""
    _metrics["active_requests"] = max(0, _metrics["active_requests"] - 1)


def record_latency(duration: float):
    """Record request latency."""
    _metrics["request_latency_seconds_sum"] += duration
    _metrics["request_latency_seconds_count"] += 1


def set_db_connections(count: int):
    """Set current active database connections."""
    _metrics["db_connections_active"] = count


@router.get("/metrics", response_class=PlainTextResponse)
def get_metrics():
    """Return Prometheus-compatible metrics."""
    avg_latency = 0.0
    if _metrics["request_latency_seconds_count"] > 0:
        avg_latency = (
            _metrics["request_latency_seconds_sum"]
            / _metrics["request_latency_seconds_count"]
        )

    lines = [
        "# HELP total_requests Total number of HTTP requests received.",
        "# TYPE total_requests counter",
        f'total_requests {_metrics["total_requests"]}',
        "",
        "# HELP active_requests Number of HTTP requests currently being processed.",
        "# TYPE active_requests gauge",
        f'active_requests {_metrics["active_requests"]}',
        "",
        "# HELP request_latency_seconds Average request latency in seconds.",
        "# TYPE request_latency_seconds gauge",
        f"request_latency_seconds {avg_latency:.6f}",
        "",
        "# HELP request_latency_seconds_count Total number of latency observations.",
        "# TYPE request_latency_seconds_count counter",
        f'request_latency_seconds_count {_metrics["request_latency_seconds_count"]}',
        "",
        "# HELP db_connections_active Number of active database connections.",
        "# TYPE db_connections_active gauge",
        f'db_connections_active {_metrics["db_connections_active"]}',
    ]
    return "\n".join(lines) + "\n"
