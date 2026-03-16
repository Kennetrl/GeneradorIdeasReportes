"""
Router para ejecutar y monitorear scrapers.
"""

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from backend.services.scraper_service import run_scraper_and_save
from backend.database import get_supabase

router = APIRouter(prefix="/scraper", tags=["scraper"])

ALL_SCRAPERS = ["reddit", "reviews", "alt", "hn", "ph", "apps"]


class RunRequest(BaseModel):
    scrapers: list[str] = ALL_SCRAPERS


def _run_scrapers_background(scrapers: list[str]):
    """Ejecuta scrapers en background y registra la corrida."""
    db = get_supabase()

    for name in scrapers:
        # Registrar inicio
        run_record = db.table("scrape_runs").insert({
            "source": name,
            "status": "running",
        }).execute()
        run_id = run_record.data[0]["id"] if run_record.data else None

        try:
            stats = run_scraper_and_save(name)
            if run_id:
                db.table("scrape_runs").update({
                    "status": "completed",
                    "items_found": stats["total"],
                    "items_new": stats["new"],
                    "finished_at": "now()",
                }).eq("id", run_id).execute()
        except Exception as e:
            if run_id:
                db.table("scrape_runs").update({
                    "status": "failed",
                    "error_message": str(e),
                    "finished_at": "now()",
                }).eq("id", run_id).execute()


@router.post("/run")
def run_scrapers(request: RunRequest, background_tasks: BackgroundTasks):
    """Ejecuta scrapers en background. No bloquea la respuesta."""
    invalid = [s for s in request.scrapers if s not in ALL_SCRAPERS]
    if invalid:
        return {"error": f"Scrapers desconocidos: {invalid}", "valid": ALL_SCRAPERS}

    background_tasks.add_task(_run_scrapers_background, request.scrapers)

    return {
        "message": f"Scrapers iniciados: {request.scrapers}",
        "status": "running",
    }


@router.get("/runs")
def list_runs(limit: int = 20):
    """Historial de ejecuciones de scrapers."""
    db = get_supabase()
    result = (
        db.table("scrape_runs")
        .select("*")
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"data": result.data or []}
