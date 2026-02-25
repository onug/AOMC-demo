"""Tamper-evident audit trail with SHA-256 hash chaining."""

import hashlib
import json
from datetime import datetime, timezone

import asyncpg

_pool: asyncpg.Pool | None = None


async def init(pool: asyncpg.Pool):
    global _pool
    _pool = pool


def _compute_hash(agent: str, action: str, result: str, detail: str, prev_hash: str) -> str:
    payload = json.dumps(
        {"agent": agent, "action": action, "result": result, "detail": detail, "prev": prev_hash},
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode()).hexdigest()


async def append(agent: str, action: str, result: str, detail: str = "") -> dict:
    # Get previous hash
    last = await _pool.fetchrow(
        "SELECT hash FROM audit_trail ORDER BY id DESC LIMIT 1"
    )
    prev_hash = last["hash"] if last else "GENESIS"

    entry_hash = _compute_hash(agent, action, result, detail, prev_hash)
    now = datetime.now(timezone.utc)

    row = await _pool.fetchrow(
        """INSERT INTO audit_trail (ts, agent, action, result, detail, prev_hash, hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
        now, agent, action, result, detail, prev_hash, entry_hash,
    )
    return dict(row)


async def get_all() -> list[dict]:
    rows = await _pool.fetch("SELECT * FROM audit_trail ORDER BY id")
    return [dict(r) for r in rows]


async def clear():
    await _pool.execute("TRUNCATE audit_trail RESTART IDENTITY")
