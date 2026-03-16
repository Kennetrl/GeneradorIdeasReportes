"""
Router de búsqueda semántica.
"""

from fastapi import APIRouter
from backend.schemas.search import SearchRequest
from backend.services.search_service import semantic_search

router = APIRouter(prefix="/search", tags=["search"])


@router.post("")
def search(request: SearchRequest):
    """Búsqueda semántica sobre los insights usando embeddings."""
    results = semantic_search(
        query=request.query,
        source=request.source,
        product_name=request.product_name,
        content_type=request.content_type,
        limit=request.limit,
    )
    return {
        "query": request.query,
        "results": results,
        "total": len(results),
    }
