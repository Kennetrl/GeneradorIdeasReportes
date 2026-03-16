"""
Schemas Pydantic para insights.
"""

from pydantic import BaseModel
from datetime import date, datetime


class InsightBase(BaseModel):
    source: str
    content_type: str = "pain_point"
    title: str | None = None
    body: str
    url: str | None = None
    source_date: date | None = None
    rating: float | None = None
    upvotes: int = 0
    comments_count: int = 0
    product_name: str | None = None
    pain_keywords: list[str] = []
    metadata: dict = {}


class InsightCreate(InsightBase):
    pass


class InsightResponse(InsightBase):
    id: str
    created_at: datetime
    similarity: float | None = None

    model_config = {"from_attributes": True}


class InsightFilters(BaseModel):
    source: str | None = None
    content_type: str | None = None
    product_name: str | None = None
    min_rating: float | None = None
    max_rating: float | None = None
    min_upvotes: int | None = None
    date_from: date | None = None
    date_to: date | None = None
    limit: int = 50
    offset: int = 0
