"""
ProblemFinder API — FastAPI entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import get_settings
from backend.routers import insights, search, scraper, llm

settings = get_settings()

app = FastAPI(
    title="ProblemFinder API",
    description="Encuentra problemas reales, genera ideas validadas.",
    version="0.1.0",
)

# CORS — permite frontend en cualquier origen (ajustar en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(insights.router, prefix=settings.api_prefix)
app.include_router(search.router, prefix=settings.api_prefix)
app.include_router(scraper.router, prefix=settings.api_prefix)
app.include_router(llm.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "name": "ProblemFinder API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
