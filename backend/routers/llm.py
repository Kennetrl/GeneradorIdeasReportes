"""
Router LLM — análisis, ideas y reportes con Groq.
"""

from fastapi import APIRouter
from backend.schemas.llm import SummarizeRequest, IdeasRequest, ReportRequest
from backend.services.llm_service import summarize, generate_ideas, generate_report

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/summarize")
def summarize_insights(request: SummarizeRequest):
    """Resume pain points encontrados por query o filtros."""
    return summarize(
        query=request.query,
        insight_ids=request.insight_ids,
        source=request.source,
        product_name=request.product_name,
        limit=request.limit,
    )


@router.post("/ideas")
def get_ideas(request: IdeasRequest):
    """Genera ideas de producto basadas en pain points reales."""
    return generate_ideas(
        query=request.query,
        product_name=request.product_name,
        limit=request.limit,
    )


@router.post("/report")
def get_report(request: ReportRequest):
    """Genera reporte competitivo completo de un producto."""
    return generate_report(
        product_name=request.product_name,
        sources=request.sources,
    )
