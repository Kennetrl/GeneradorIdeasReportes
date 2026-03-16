"""
Schemas para búsqueda semántica.
"""

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    source: str | None = None
    product_name: str | None = None
    content_type: str | None = None
    limit: int = 20


class SearchResponse(BaseModel):
    query: str
    results: list[dict]
    total: int
