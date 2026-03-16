"""
Servicio que conecta los scrapers con la base de datos.
Normaliza la salida de cada scraper al schema unificado de insights.
"""

import sys
import os

# Agregar carpeta scrapers al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scrapers"))

from backend.database import get_supabase
from backend.utils.text import clean_text, content_hash, truncate
from backend.services.embedding_service import generate_embedding


# ─── Mapeo de campos por fuente ──────────────────────────────────────────────

def _normalize_reddit(item: dict) -> dict:
    return {
        "source": "reddit",
        "content_type": "pain_point",
        "title": item.get("title"),
        "body": truncate(item.get("body", "")),
        "url": item.get("url"),
        "source_date": item.get("created_date"),
        "upvotes": item.get("upvotes", 0),
        "comments_count": item.get("comments_count", 0),
        "pain_keywords": [k.strip() for k in item.get("pain_keywords", "").split(",") if k.strip()],
        "metadata": {"subreddit": item.get("subreddit")},
    }


def _normalize_review(item: dict) -> dict:
    return {
        "source": item.get("source", "review"),
        "content_type": "review",
        "title": item.get("review_title"),
        "body": truncate(item.get("review_text", "")),
        "url": item.get("review_url"),
        "source_date": item.get("date"),
        "rating": item.get("rating"),
        "product_name": item.get("product_name"),
        "metadata": {"platform": item.get("source")},
    }


def _normalize_alternativeto(item: dict) -> dict:
    return {
        "source": "alternativeto",
        "content_type": item.get("type", "con"),
        "body": truncate(item.get("text", "")),
        "url": item.get("url"),
        "product_name": item.get("tool_name"),
        "metadata": {"alt_type": item.get("type")},
    }


def _normalize_hackernews(item: dict) -> dict:
    return {
        "source": "hackernews",
        "content_type": "pain_point",
        "title": item.get("title"),
        "body": truncate(item.get("body", "")),
        "url": item.get("hn_url") or item.get("url"),
        "source_date": item.get("date"),
        "upvotes": item.get("points", 0),
        "comments_count": item.get("comments_count", 0),
        "pain_keywords": [k.strip() for k in item.get("pain_keywords", "").split(",") if k.strip()],
        "metadata": {"hn_type": item.get("type"), "author": item.get("author"), "external_url": item.get("url")},
    }


def _normalize_producthunt(item: dict) -> dict:
    is_comment = item.get("type") == "comment"
    return {
        "source": "producthunt",
        "content_type": "comment" if is_comment else "product",
        "title": None if is_comment else item.get("name"),
        "body": truncate(item.get("text", "") if is_comment else item.get("tagline", "")),
        "url": item.get("url"),
        "upvotes": item.get("votes", 0),
        "product_name": item.get("product_name") if is_comment else item.get("name"),
        "metadata": {"topic": item.get("topic")},
    }


def _normalize_appstore(item: dict) -> dict:
    return {
        "source": item.get("source", "app_store"),
        "content_type": "review",
        "title": item.get("review_title"),
        "body": truncate(item.get("review_text", "")),
        "url": item.get("url"),
        "source_date": item.get("date"),
        "rating": item.get("rating"),
        "upvotes": item.get("thumbs_up", 0) or item.get("vote_count", 0),
        "product_name": item.get("app_name"),
        "metadata": {"app_id": item.get("app_id"), "author": item.get("author")},
    }


NORMALIZERS = {
    "reddit": _normalize_reddit,
    "g2": _normalize_review,
    "capterra": _normalize_review,
    "trustpilot": _normalize_review,
    "alternativeto": _normalize_alternativeto,
    "hackernews": _normalize_hackernews,
    "producthunt": _normalize_producthunt,
    "app_store": _normalize_appstore,
    "google_play": _normalize_appstore,
}


def normalize_item(item: dict) -> dict:
    """Normaliza un item de cualquier scraper al schema unificado."""
    source = item.get("source", "")
    normalizer = NORMALIZERS.get(source)
    if not normalizer:
        raise ValueError(f"Fuente desconocida: {source}")

    normalized = normalizer(item)
    normalized["body"] = clean_text(normalized.get("body", ""))

    # Generar hash para deduplicación
    normalized["content_hash"] = content_hash(
        normalized["source"],
        normalized.get("url", ""),
        normalized.get("body", ""),
    )

    return normalized


def save_to_db(items: list[dict], generate_embeddings: bool = True) -> dict:
    """
    Guarda items normalizados en Supabase.
    Retorna stats: {total, new, duplicates}.
    """
    db = get_supabase()
    stats = {"total": len(items), "new": 0, "duplicates": 0, "errors": 0}

    for item in items:
        try:
            normalized = normalize_item(item)

            # Generar embedding
            if generate_embeddings:
                text_for_embedding = f"{normalized.get('title', '') or ''} {normalized['body']}".strip()
                if text_for_embedding:
                    normalized["embedding"] = generate_embedding(text_for_embedding)

            # Intentar insertar (si content_hash ya existe, se ignora)
            result = db.table("insights").upsert(
                normalized,
                on_conflict="content_hash",
                ignore_duplicates=True,
            ).execute()

            if result.data:
                stats["new"] += 1
            else:
                stats["duplicates"] += 1

        except Exception as e:
            stats["errors"] += 1
            print(f"[DB] Error guardando item: {e}")

    print(f"[DB] Total: {stats['total']} | Nuevos: {stats['new']} | Duplicados: {stats['duplicates']} | Errores: {stats['errors']}")
    return stats


def run_scraper_and_save(scraper_name: str, **kwargs) -> dict:
    """Ejecuta un scraper y guarda los resultados en la DB."""
    from reddit_scraper import RedditScraper
    from review_scraper import ReviewScraper
    from alternativeto_scraper import AlternativeToScraper
    from hackernews_scraper import HackerNewsScraper
    from producthunt_scraper import ProductHuntScraper
    from appstore_scraper import AppStoreScraper

    SCRAPERS = {
        "reddit": RedditScraper,
        "reviews": ReviewScraper,
        "alt": AlternativeToScraper,
        "hn": HackerNewsScraper,
        "ph": ProductHuntScraper,
        "apps": AppStoreScraper,
    }

    scraper_class = SCRAPERS.get(scraper_name)
    if not scraper_class:
        raise ValueError(f"Scraper desconocido: {scraper_name}")

    print(f"\n[Scraper] Ejecutando: {scraper_name}")
    scraper = scraper_class()
    results = scraper.run(**kwargs)

    print(f"[Scraper] {scraper_name}: {len(results)} resultados obtenidos")

    if results:
        stats = save_to_db(results)
        return stats

    return {"total": 0, "new": 0, "duplicates": 0, "errors": 0}
