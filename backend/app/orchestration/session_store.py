"""Redis-backed session store for WorkflowState."""

import json
import os
from typing import Optional

import redis.asyncio as aioredis

from .state import WorkflowState

_REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/2")
_TTL = int(os.getenv("SESSION_TTL_SECONDS", "3600"))  # 1 hour default

_pool: Optional[aioredis.Redis] = None


def _get_redis() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(_REDIS_URL, decode_responses=True)
    return _pool


async def save_state(state: WorkflowState) -> None:
    r = _get_redis()
    key = f"workflow:session:{state.session_id}"
    await r.set(key, json.dumps(state.serialize()), ex=_TTL)


async def load_state(session_id: str) -> Optional[WorkflowState]:
    r = _get_redis()
    key = f"workflow:session:{session_id}"
    raw = await r.get(key)
    if raw is None:
        return None
    return WorkflowState.deserialize(json.loads(raw))


async def delete_state(session_id: str) -> None:
    r = _get_redis()
    key = f"workflow:session:{session_id}"
    await r.delete(key)
