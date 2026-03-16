"""
Reddit Scraper — El pozo de las quejas y la "Prueba de Vida"
─────────────────────────────────────────────────────────────
Usa la API JSON pública de Reddit (sin credenciales) para extraer posts
con señales de dolor.

Qué extrae:
  - title, body, url, upvotes, comments_count, subreddit, created_date
  - pain_keywords: palabras clave de dolor que dispararon el match

Configuración: edita REDDIT_* en config.py
No requiere credenciales — usa https://www.reddit.com/r/{sub}/top.json
"""

import time
import requests
from datetime import datetime, timezone
from base_scraper import BaseScraper
from config import (
    REDDIT_SUBREDDITS,
    REDDIT_PAIN_KEYWORDS,
    REDDIT_TIME_FILTER,
    REDDIT_POST_LIMIT,
)

REDDIT_JSON_URL = "https://www.reddit.com/r/{subreddit}/top.json"
USER_AGENT = "IdeaScraperBot/1.0 (research scraper)"


class RedditScraper(BaseScraper):
    def __init__(self):
        super().__init__("reddit")
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def _fetch_posts(self, subreddit: str, time_filter: str, limit: int) -> list[dict]:
        """Trae posts de un subreddit usando la API JSON pública."""
        posts = []
        after = None

        while len(posts) < limit:
            params = {
                "t": time_filter,
                "limit": min(100, limit - len(posts)),
                "raw_json": 1,
            }
            if after:
                params["after"] = after

            try:
                resp = self.session.get(
                    REDDIT_JSON_URL.format(subreddit=subreddit),
                    params=params,
                    timeout=15,
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"[Reddit] Error HTTP en r/{subreddit}: {e}")
                break

            children = data.get("data", {}).get("children", [])
            if not children:
                break

            for child in children:
                posts.append(child.get("data", {}))

            after = data.get("data", {}).get("after")
            if not after:
                break

            time.sleep(1)  # rate limit amigable

        return posts

    def scrape(
        self,
        subreddits: list[str] | None = None,
        keywords: list[str] | None = None,
        time_filter: str | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        """
        Recorre los subreddits y extrae posts que contienen palabras clave de dolor.

        Args:
            subreddits:   Lista de subreddits (sin r/). Default: config.REDDIT_SUBREDDITS
            keywords:     Palabras clave de dolor.     Default: config.REDDIT_PAIN_KEYWORDS
            time_filter:  "day","week","month","year","all"
            limit:        Máximo de posts por subreddit

        Returns:
            Lista de dicts con los datos extraídos.
        """
        subreddits = subreddits or REDDIT_SUBREDDITS
        keywords = keywords or REDDIT_PAIN_KEYWORDS
        time_filter = time_filter or REDDIT_TIME_FILTER
        limit = limit or REDDIT_POST_LIMIT

        self.results = []

        for sub_name in subreddits:
            print(f"[Reddit] Scrapeando r/{sub_name} …")
            try:
                posts = self._fetch_posts(sub_name, time_filter, limit)

                for post in posts:
                    title = post.get("title", "")
                    selftext = post.get("selftext", "")
                    combined = f"{title} {selftext}"

                    if not self._contains_keywords(combined, keywords):
                        continue

                    self.results.append({
                        "source": "reddit",
                        "subreddit": sub_name,
                        "title": title,
                        "body": selftext[:2000],
                        "url": f"https://reddit.com{post.get('permalink', '')}",
                        "upvotes": post.get("score", 0),
                        "comments_count": post.get("num_comments", 0),
                        "created_date": datetime.fromtimestamp(
                            post.get("created_utc", 0), tz=timezone.utc
                        ).strftime("%Y-%m-%d"),
                        "pain_keywords": ", ".join(
                            self._matched_keywords(combined, keywords)
                        ),
                    })

                time.sleep(1)  # pausa entre subreddits

            except Exception as e:
                print(f"[Reddit] Error en r/{sub_name}: {e}")

        print(f"[Reddit] Total posts con señales de dolor: {len(self.results)}")
        return self.results

    # ── Alias conveniente ──────────────────────────────────────────────────────
    def run(self, **kwargs) -> list[dict]:
        self.scrape(**kwargs)
        self.save("reddit_pain_posts")
        return self.results


if __name__ == "__main__":
    scraper = RedditScraper()
    scraper.run()
