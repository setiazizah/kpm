"""Pre-step hooks: Logging, Auth, Quota.

These are called directly inside each Prefect flow before submitting tasks.
"""

import logging
import os
from typing import Optional

logger = logging.getLogger("workflow.hooks.pre")

_QUOTA_STORE: dict[str, int] = {}
MAX_REQUESTS_PER_SESSION = int(os.getenv("MAX_REQUESTS_PER_SESSION", "50"))


class LoggingPreHook:
    def run(self, step_name: str, session_id: str, query: Optional[str] = None) -> None:
        logger.info("[PRE] step=%s session=%s query=%s", step_name, session_id, (query or "")[:80])


class AuthPreHook:
    """Validates that user_id is present. Raise to block the step."""

    def run(self, user_id: str, session_id: str) -> None:
        if not user_id:
            raise PermissionError(f"Missing user_id for session {session_id}")


class QuotaPreHook:
    """Simple in-memory quota guard per session."""

    def run(self, session_id: str) -> None:
        count = _QUOTA_STORE.get(session_id, 0) + 1
        _QUOTA_STORE[session_id] = count
        if count > MAX_REQUESTS_PER_SESSION:
            raise RuntimeError(
                f"Session {session_id} exceeded quota ({MAX_REQUESTS_PER_SESSION} requests)"
            )
