"""
Hacker News Scraper — Validación técnica de alto nivel
────────────────────────────────────────────────────────
Usa la API gratuita de Algolia (sin auth, sin bloqueos) para extraer:
  - Posts "Ask HN: Is there a tool for X?" → demanda explícita
  - Posts "Show HN" con comentarios negativos → feedback de early adopters
  - Threads sobre frustración con herramientas actuales

API usada: https://hn.algolia.com/api/v1/
  - Sin autenticación
  - Sin límite agresivo de rate (razonable con pauses)

Qué extrae:
  - title, url, points, comments_count, author, date, type, matched_keywords
"""

import time
import requests
from base_scraper import BaseScraper
from config import (
    HN_PAIN_KEYWORDS,
    HN_TAGS,
    HN_MIN_POINTS,
    HN_MIN_COMMENTS,
    HN_MAX_PAGES,
)

ALGOLIA_BASE = "https://hn.algolia.com/api/v1/search"
HN_ITEM_BASE = "https://news.ycombinator.com/item?id="


class HackerNewsScraper(BaseScraper):
    def __init__(self):
        super().__init__("hackernews")

    def _search(self, query: str, tags: str, page: int = 0) -> dict:
        """Llama a la API de Algolia HN."""
        params = {
            "query": query,
            "tags": tags,
            "hitsPerPage": 50,
            "page": page,
        }
        try:
            resp = requests.get(ALGOLIA_BASE, params=params, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"[HN] Error en búsqueda '{query}': {e}")
            return {"hits": [], "nbPages": 0}

    def scrape(
        self,
        keywords: list[str] | None = None,
        tags: list[str] | None = None,
        min_points: int | None = None,
        min_comments: int | None = None,
        max_pages: int | None = None,
    ) -> list[dict]:
        """
        Busca posts en HN que contengan las keywords y cumplan los filtros.

        Args:
            keywords:     Términos de búsqueda. Default: config.HN_PAIN_KEYWORDS
            tags:         Tipos de post HN. Default: config.HN_TAGS
                          Opciones: "story","ask_hn","show_hn","comment","poll"
            min_points:   Mínimo de upvotes. Default: config.HN_MIN_POINTS
            min_comments: Mínimo de comentarios. Default: config.HN_MIN_COMMENTS
            max_pages:    Páginas de resultados por query. Default: config.HN_MAX_PAGES
        """
        keywords = keywords or HN_PAIN_KEYWORDS
        tags = tags or HN_TAGS
        min_points = min_points if min_points is not None else HN_MIN_POINTS
        min_comments = min_comments if min_comments is not None else HN_MIN_COMMENTS
        max_pages = max_pages or HN_MAX_PAGES

        seen_ids: set[str] = set()
        self.results = []

        for tag in tags:
            for keyword in keywords:
                print(f"[HN] Buscando [{tag}] '{keyword}' …")

                for page in range(max_pages):
                    data = self._search(keyword, tag, page)
                    hits = data.get("hits", [])

                    if not hits:
                        break

                    for hit in hits:
                        item_id = hit.get("objectID", "")
                        if item_id in seen_ids:
                            continue

                        points = hit.get("points") or 0
                        num_comments = hit.get("num_comments") or 0

                        if points < min_points or num_comments < min_comments:
                            continue

                        seen_ids.add(item_id)
                        title = hit.get("title") or hit.get("story_title") or ""
                        body = hit.get("story_text") or hit.get("comment_text") or ""

                        combined = f"{title} {body}"
                        matched = self._matched_keywords(combined, keywords)

                        self.results.append({
                            "source": "hackernews",
                            "type": tag,
                            "title": title,
                            "body": body[:1500],
                            "url": hit.get("url") or f"{HN_ITEM_BASE}{item_id}",
                            "hn_url": f"{HN_ITEM_BASE}{item_id}",
                            "points": points,
                            "comments_count": num_comments,
                            "author": hit.get("author", ""),
                            "date": hit.get("created_at", "")[:10],
                            "pain_keywords": ", ".join(matched),
                        })

                    if page >= data.get("nbPages", 1) - 1:
                        break

                    time.sleep(0.5)  # rate limit amigable

        print(f"[HN] Total posts encontrados: {len(self.results)}")
        return self.results

    def run(self, **kwargs) -> list[dict]:
        self.scrape(**kwargs)
        self.save("hackernews_insights")
        return self.results


if __name__ == "__main__":
    scraper = HackerNewsScraper()
    scraper.run()
