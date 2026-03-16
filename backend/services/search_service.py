"""
Servicio de búsqueda semántica usando pgvector en Supabase.
"""

from backend.database import get_supabase
from backend.services.embedding_service import generate_embedding


def semantic_search(
    query: str,
    source: str | None = None,
    product_name: str | None = None,
    content_type: str | None = None,
    limit: int = 20,
) -> list[dict]:
    """
    Búsqueda semántica: convierte el query en embedding y busca
    los insights más similares en Supabase via pgvector.
    """
    db = get_supabase()

    query_embedding = generate_embedding(query)

    # Llamar a la función RPC en Supabase para búsqueda por similitud
    params = {
        "query_embedding": query_embedding,
        "match_count": limit,
    }

    if source:
        params["filter_source"] = source
    if product_name:
        params["filter_product"] = product_name
    if content_type:
        params["filter_content_type"] = content_type

    result = db.rpc("search_insights", params).execute()

    return result.data or []


def filtered_search(
    source: str | None = None,
    content_type: str | None = None,
    product_name: str | None = None,
    min_rating: float | None = None,
    max_rating: float | None = None,
    min_upvotes: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """Búsqueda filtrada (sin embeddings, SQL puro)."""
    db = get_supabase()

    query = db.table("insights").select("*")

    if source:
        query = query.eq("source", source)
    if content_type:
        query = query.eq("content_type", content_type)
    if product_name:
        query = query.eq("product_name", product_name)
    if min_rating is not None:
        query = query.gte("rating", min_rating)
    if max_rating is not None:
        query = query.lte("rating", max_rating)
    if min_upvotes is not None:
        query = query.gte("upvotes", min_upvotes)
    if date_from:
        query = query.gte("source_date", date_from)
    if date_to:
        query = query.lte("source_date", date_to)

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    return result.data or []
