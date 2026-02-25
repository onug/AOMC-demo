"""AOMC Gateway — Reverse proxy with 6-control enforcement chain."""

import os

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import proxy
import middleware

app = FastAPI(title="AOMC Gateway")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    await proxy.init()


@app.on_event("shutdown")
async def shutdown():
    await proxy.close()


def _route_to_service(path: str) -> tuple[str, str]:
    """Map incoming path to (service_name, backend_path)."""
    if path.startswith("/api/customers"):
        return "customer-db-api", path
    if path.startswith("/api/metrics"):
        return "metrics-api", path
    if path.startswith("/api/tools"):
        return "tools-api", path
    return "", path


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_proxy(request: Request, path: str):
    full_path = f"/api/{path}"

    # Run enforcement chain
    block = await middleware.enforce(request)
    if block:
        status = block.pop("status", 403)
        return JSONResponse(status_code=status, content=block)

    # Route to backend
    service, backend_path = _route_to_service(full_path)
    if not service:
        return JSONResponse(status_code=404, content={"error": f"No backend for path: {full_path}"})

    try:
        # Forward request
        body = await request.body()
        headers = {
            k: v for k, v in request.headers.items()
            if k.lower() not in ("host", "content-length", "transfer-encoding")
        }
        resp = await proxy.forward(
            service, backend_path,
            method=request.method,
            content=body if body else None,
            headers=headers,
        )

        # DLP post-processing on response
        response_text = resp.text
        agent_id = request.headers.get("X-Agent-ID", "")
        processed, findings = middleware.post_process_response(response_text, agent_id)

        response_headers = {}
        # Pass through data classification header
        if "X-Data-Classification" in resp.headers:
            response_headers["X-Data-Classification"] = resp.headers["X-Data-Classification"]
        if findings:
            response_headers["X-DLP-Findings"] = str(findings)

        return Response(
            content=processed,
            status_code=resp.status_code,
            headers=response_headers,
            media_type=resp.headers.get("content-type", "application/json"),
        )

    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"Backend error: {str(e)}"})


@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "gateway"}
