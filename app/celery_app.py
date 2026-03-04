import os
from celery import Celery

broker = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
backend = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

celery = Celery("tim4", broker=broker, backend=backend)
celery.conf.timezone = "Asia/Jakarta"
celery.conf.task_track_started = True
celery.conf.worker_prefetch_multiplier = 1