"""Redis pub/sub event publisher + WebSocket broadcaster."""

import asyncio
import json
from datetime import datetime, timezone

import redis.asyncio as redis

_redis: redis.Redis | None = None
_ws_clients: set = set()

CHANNEL = "aomc:events"


async def init(redis_url: str):
    global _redis
    _redis = redis.from_url(redis_url, decode_responses=True)


async def publish(event: dict):
    """Publish an event to Redis and all connected WebSocket clients."""
    global _ws_clients
    if "timestamp" not in event:
        event["timestamp"] = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
    payload = json.dumps(event)
    if _redis:
        try:
            await _redis.publish(CHANNEL, payload)
        except Exception:
            pass
    # Broadcast to WebSocket clients directly
    dead = set()
    for ws in _ws_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.add(ws)
    _ws_clients -= dead


def register_ws(ws):
    _ws_clients.add(ws)


def unregister_ws(ws):
    _ws_clients.discard(ws)


async def subscribe_redis():
    """Background task: subscribe to Redis and forward to WS clients."""
    global _ws_clients
    if not _redis:
        return
    pubsub = _redis.pubsub()
    await pubsub.subscribe(CHANNEL)
    async for message in pubsub.listen():
        if message["type"] == "message":
            dead = set()
            for ws in _ws_clients:
                try:
                    await ws.send_text(message["data"])
                except Exception:
                    dead.add(ws)
            _ws_clients -= dead
