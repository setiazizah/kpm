"""Base utilities shared across steps."""

import time
from typing import Callable, Optional

from ..state import StepMeta


def make_meta(start: float, *, fallback_used: bool = False) -> StepMeta:
    """Build a StepMeta from a start timestamp."""
    latency_ms = int((time.monotonic() - start) * 1000)
    return StepMeta(
        status="fallback" if fallback_used else "success",
        latency_ms=latency_ms,
        fallback_used=fallback_used,
    )


def error_meta(start: float) -> StepMeta:
    latency_ms = int((time.monotonic() - start) * 1000)
    return StepMeta(status="error", latency_ms=latency_ms, fallback_used=False)
