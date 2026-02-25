"""Metrics API — Synthetic infrastructure metrics for monitoring agents."""

import random
import time

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Metrics API")

# Synthetic infrastructure metrics
_start = time.time()


def _uptime():
    return round(time.time() - _start, 1)


@app.get("/api/metrics")
async def get_metrics():
    """Current infrastructure metrics."""
    return JSONResponse(content={
        "cpu_usage": round(random.uniform(15, 75), 1),
        "memory_usage": round(random.uniform(40, 85), 1),
        "disk_io_mbps": round(random.uniform(10, 200), 1),
        "network_rx_mbps": round(random.uniform(50, 500), 1),
        "network_tx_mbps": round(random.uniform(20, 300), 1),
        "active_connections": random.randint(100, 5000),
        "request_rate_rps": random.randint(50, 2000),
        "error_rate_pct": round(random.uniform(0, 2.5), 2),
        "uptime_seconds": _uptime(),
        "node_count": 14203,
    })


@app.get("/api/metrics/alerts")
async def get_alerts():
    """Active alerts."""
    alerts = []
    if random.random() > 0.7:
        alerts.append({
            "severity": random.choice(["warning", "critical"]),
            "message": random.choice([
                "High CPU on node-dc2-07",
                "Memory pressure on k8s-worker-12",
                "Disk I/O spike on storage-pool-3",
                "Network latency increase on edge-router-05",
            ]),
            "timestamp": time.strftime("%H:%M:%S"),
        })
    return JSONResponse(content={"alerts": alerts})


@app.get("/api/metrics/logs")
async def get_logs():
    """Recent infrastructure logs."""
    log_templates = [
        "INFO  Node health check passed: {node}",
        "INFO  BGP session established with peer {peer}",
        "WARN  High memory usage on {node}: {pct}%",
        "INFO  Certificate rotation completed for {node}",
        "INFO  Firewall rule audit: {count} rules active",
    ]
    logs = []
    for _ in range(5):
        template = random.choice(log_templates)
        logs.append({
            "timestamp": time.strftime("%H:%M:%S"),
            "message": template.format(
                node=f"node-dc{random.randint(1,3)}-{random.randint(1,20):02d}",
                peer=f"10.{random.randint(1,3)}.{random.randint(0,255)}.1",
                pct=random.randint(70, 95),
                count=random.randint(2000, 3000),
            ),
        })
    return JSONResponse(content={"logs": logs})


@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "metrics-api"}
