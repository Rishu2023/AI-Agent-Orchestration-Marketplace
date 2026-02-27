import time
import os
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds security headers including Content Security Policy to all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )
        return response


class BruteForceProtectionMiddleware(BaseHTTPMiddleware):
    """Protects login endpoint against brute force attacks.

    Locks out an IP after max_attempts failed login attempts within the window.
    Disabled during testing.
    """

    def __init__(self, app, max_attempts: int = 5, lockout_seconds: int = 900):
        super().__init__(app)
        self.max_attempts = max_attempts
        self.lockout_seconds = lockout_seconds
        self._failed_attempts: dict[str, list[float]] = {}
        self._lockouts: dict[str, float] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        if os.environ.get("TESTING") == "1":
            return await call_next(request)

        if request.url.path == "/api/v1/auth/login" and request.method == "POST":
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()

            lockout_until = self._lockouts.get(client_ip, 0)
            if now < lockout_until:
                remaining = int(lockout_until - now)
                logger.warning(
                    "Brute force lockout active for IP %s, %ds remaining",
                    client_ip,
                    remaining,
                )
                from starlette.responses import JSONResponse

                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many failed login attempts. Account temporarily locked.",
                        "retry_after": remaining,
                    },
                    headers={"Retry-After": str(remaining)},
                )

            response = await call_next(request)

            if response.status_code in (401, 403):
                attempts = self._failed_attempts.get(client_ip, [])
                cutoff = now - self.lockout_seconds
                attempts = [t for t in attempts if t > cutoff]
                attempts.append(now)
                self._failed_attempts[client_ip] = attempts

                if len(attempts) >= self.max_attempts:
                    self._lockouts[client_ip] = now + self.lockout_seconds
                    logger.warning(
                        "IP %s locked out after %d failed login attempts",
                        client_ip,
                        len(attempts),
                    )
            elif response.status_code == 200:
                self._failed_attempts.pop(client_ip, None)
                self._lockouts.pop(client_ip, None)

            return response

        return await call_next(request)
