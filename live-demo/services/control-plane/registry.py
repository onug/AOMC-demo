"""Agent registry — backed by Postgres agents table."""

import asyncpg

_pool: asyncpg.Pool | None = None


async def init(pool: asyncpg.Pool):
    global _pool
    _pool = pool


async def get_agent(agent_id: str) -> dict | None:
    row = await _pool.fetchrow("SELECT * FROM agents WHERE id = $1", agent_id)
    return dict(row) if row else None


async def list_agents() -> list[dict]:
    rows = await _pool.fetch("SELECT * FROM agents ORDER BY id")
    return [dict(r) for r in rows]


async def is_quarantined(agent_id: str) -> bool:
    row = await _pool.fetchrow(
        "SELECT quarantined FROM agents WHERE id = $1", agent_id
    )
    return row["quarantined"] if row else False


async def quarantine(agent_id: str):
    await _pool.execute(
        "UPDATE agents SET quarantined = TRUE WHERE id = $1", agent_id
    )


async def unquarantine(agent_id: str):
    await _pool.execute(
        "UPDATE agents SET quarantined = FALSE WHERE id = $1", agent_id
    )


async def unquarantine_all():
    await _pool.execute("UPDATE agents SET quarantined = FALSE")


async def get_tool_permissions(agent_id: str) -> list[str]:
    rows = await _pool.fetch(
        "SELECT tool_name FROM tool_permissions WHERE agent_id = $1", agent_id
    )
    return [r["tool_name"] for r in rows]


async def get_risk_level(tool_name: str) -> str:
    row = await _pool.fetchrow(
        "SELECT risk FROM risk_levels WHERE tool_name = $1", tool_name
    )
    return row["risk"] if row else "HIGH"


async def check_zero_trust_policy(src_domain: str, dst_domain: str) -> bool:
    row = await _pool.fetchrow(
        "SELECT allowed FROM zero_trust_policies WHERE src_domain = $1 AND dst_domain = $2 AND allowed = TRUE",
        src_domain,
        dst_domain,
    )
    return row is not None
