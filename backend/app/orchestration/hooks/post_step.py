"""Post-step hooks: Logging, Caching, Monitoring."""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("workflow.hooks.post")

# Simple in-memory cache keyed by (session_id, step_name)
_CACHE: Dict[tuple, Any] = {}


class LoggingPostHook:
    def run(self, step_name: str, session_id: str, status: str, latency_ms: int) -> None:
        logger.info(
            "[POST] step=%s session=%s status=%s latency=%dms",
            step_name, session_id, status, latency_ms,
        )


class CachingPostHook:
    """Cache step outputs so repeated identical requests are fast."""

    def store(self, step_name: str, session_id: str, value: Any) -> None:
        _CACHE[(session_id, step_name)] = value

    def get(self, step_name: str, session_id: str) -> Optional[Any]:
        return _CACHE.get((session_id, step_name))


class MonitoringPostHook:
    """Placeholder for Prometheus / OpenTelemetry metrics."""

    def run(self, step_name: str, status: str, latency_ms: int, fallback_used: bool) -> None:
        # TODO: push to prometheus_client Counter / Histogram
        logger.debug(
            "[METRICS] step=%s status=%s latency=%dms fallback=%s",
            step_name, status, latency_ms, fallback_used,
        )
