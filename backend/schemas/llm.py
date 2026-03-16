"""
Schemas para endpoints de LLM (Groq).
"""

from pydantic import BaseModel


class SummarizeRequest(BaseModel):
    query: str | None = None
    insight_ids: list[str] | None = None
    source: str | None = None
    product_name: str | None = None
    limit: int = 15


class IdeasRequest(BaseModel):
    query: str | None = None
    product_name: str | None = None
    limit: int = 15


class ReportRequest(BaseModel):
    product_name: str
    sources: list[str] | None = None


class LLMResponse(BaseModel):
    content: str
    model: str
    sources_used: int
