"""Customer Database API — PII database wrapper with classification headers."""

import os

import asyncpg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Customer DB API")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://aomc:aomc@postgres:5432/aomc")
pool: asyncpg.Pool | None = None


@app.on_event("startup")
async def startup():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)


@app.get("/api/customers")
async def get_customers():
    """Full PII data — restricted to data_analyst role."""
    rows = await pool.fetch("SELECT * FROM customers ORDER BY id")
    data = [dict(r) for r in rows]
    return JSONResponse(
        content=data,
        headers={"X-Data-Classification": "PII"},
    )


@app.get("/api/customers/pci")
async def get_pci():
    """Full PCI cardholder data — restricted."""
    count = await pool.fetchrow("SELECT COUNT(*) as count FROM cardholder_data")
    rows = await pool.fetch("SELECT * FROM cardholder_data LIMIT 20")
    return JSONResponse(
        content={"total_records": count["count"], "sample": [dict(r) for r in rows]},
        headers={"X-Data-Classification": "PCI"},
    )


@app.get("/api/customers/anonymized")
async def get_anonymized():
    """Anonymized data — safe for broader access."""
    rows = await pool.fetch("SELECT id, name, balance FROM customers ORDER BY id")
    data = []
    for r in rows:
        data.append({
            "id": r["id"],
            "name": r["name"][:1] + "***",
            "balance_range": _balance_range(r["balance"]),
        })
    return JSONResponse(
        content=data,
        headers={"X-Data-Classification": "ANONYMIZED"},
    )


@app.get("/api/customers/public")
async def get_public():
    """Public aggregate data — no PII."""
    row = await pool.fetchrow("SELECT COUNT(*) as count FROM customers")
    return JSONResponse(
        content={"total_customers": row["count"], "status": "active"},
        headers={"X-Data-Classification": "PUBLIC"},
    )


def _balance_range(bal: str) -> str:
    # Parse "$2.4M" style to a range
    val = bal.replace("$", "").replace(",", "")
    if "M" in val:
        return "$1M+"
    if "K" in val:
        num = float(val.replace("K", ""))
        if num > 500:
            return "$500K-1M"
        return "<$500K"
    return "Unknown"


@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "customer-db-api"}
