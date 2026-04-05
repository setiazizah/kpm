import os
from celery import Celery
from celery.schedules import crontab

broker  = os.getenv("CELERY_BROKER_URL",     "redis://redis:6379/0")
backend = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

celery = Celery("tim4", broker=broker, backend=backend)
celery.conf.timezone               = "Asia/Jakarta"
celery.conf.task_track_started     = True
celery.conf.worker_prefetch_multiplier = 1

# Auto-discover tasks dari folder tasks/
celery.autodiscover_tasks(["app.tasks"])

# Jadwal otomatis: ingest data baru tiap 6 jam (ADR-005)
celery.conf.beat_schedule = {
    "ingest-every-6-hours": {
        "task"    : "tasks.ingest_new_content",
        "schedule": crontab(minute=0, hour="*/6"),
    },
}
