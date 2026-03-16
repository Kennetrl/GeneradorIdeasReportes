"""
Router de insights — CRUD y filtros.
"""

from fastapi import APIRouter, Query
from backend.database import get_supabase
from backend.services.search_service import filtered_search

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("")
def list_insights(
    source: str | None = None,
    content_type: str | None = None,
    product_name: str | None = None,
    min_rating: float | None = None,
    max_rating: float | None = None,
    min_upvotes: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    """Lista insights con filtros opcionales."""
    results = filtered_search(
        source=source,
        content_type=content_type,
        product_name=product_name,
        min_rating=min_rating,
        max_rating=max_rating,
        min_upvotes=min_upvotes,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return {"data": results, "count": len(results)}


@router.get("/stats")
def get_stats():
    """Estadísticas generales por fuente, producto, etc."""
    db = get_supabase()

    # Total por fuente
    all_data = db.table("insights").select("source, content_type, product_name").execute()
    rows = all_data.data or []

    by_source: dict[str, int] = {}
    by_type: dict[str, int] = {}
    by_product: dict[str, int] = {}

    for r in rows:
        src = r.get("source", "unknown")
        by_source[src] = by_source.get(src, 0) + 1

        ct = r.get("content_type", "unknown")
        by_type[ct] = by_type.get(ct, 0) + 1

        pn = r.get("product_name")
        if pn:
            by_product[pn] = by_product.get(pn, 0) + 1

    return {
        "total": len(rows),
        "by_source": dict(sorted(by_source.items(), key=lambda x: -x[1])),
        "by_content_type": dict(sorted(by_type.items(), key=lambda x: -x[1])),
        "by_product": dict(sorted(by_product.items(), key=lambda x: -x[1])),
    }


@router.get("/{insight_id}")
def get_insight(insight_id: str):
    """Obtiene un insight por ID."""
    db = get_supabase()
    result = db.table("insights").select("*").eq("id", insight_id).single().execute()
    return result.data
