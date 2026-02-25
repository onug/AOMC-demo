"""Request forwarding to backend services."""

import os

import httpx

# Backend service URLs
BACKENDS = {
    "customer-db-api": os.getenv("CUSTOMER_DB_API_URL", "http://customer-db-api:8001"),
    "metrics-api": os.getenv("METRICS_API_URL", "http://metrics-api:8002"),
    "tools-api": os.getenv("TOOLS_API_URL", "http://tools-api:8003"),
}

CONTROL_PLANE_URL = os.getenv("CONTROL_PLANE_URL", "http://aomc-control-plane:8000")

_client: httpx.AsyncClient | None = None


async def init():
    global _client
    _client = httpx.AsyncClient(timeout=10.0)


async def close():
    if _client:
        await _client.aclose()


async def forward(service: str, path: str, method: str = "GET", **kwargs) -> httpx.Response:
    base = BACKENDS.get(service)
    if not base:
        raise ValueError(f"Unknown backend service: {service}")
    url = f"{base}{path}"
    return await _client.request(method, url, **kwargs)


async def control_plane(path: str, method: str = "POST", **kwargs) -> httpx.Response:
    url = f"{CONTROL_PLANE_URL}{path}"
    return await _client.request(method, url, **kwargs)
