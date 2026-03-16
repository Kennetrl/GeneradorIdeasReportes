"""
App Store + Google Play Scraper — Reseñas móviles (1-2 estrellas)
───────────────────────────────────────────────────────────────────
Si tu nicho tiene apps móviles, estas reseñas son una mina de oro.
La gente en mobile es mucho más directa y emocional en sus quejas.

Qué extrae:
  - platform, app_name, app_id, rating, review_title, review_text,
    author, date, thumbs_up (Google Play) / vote_count (App Store)

Librerías:
  - google-play-scraper  → Google Play (sin auth, sin browser)
  - iTunes Search API    → buscar apps por keyword (gratuita)
  - Playwright           → reseñas de App Store (web)

Configuración: edita APPSTORE_TARGETS en config.py
"""

import asyncio
import time
import requests
from playwright.async_api import async_playwright, Page
from base_scraper import BaseScraper
from config import (
    APPSTORE_TARGETS,
    APPSTORE_REVIEW_MAX_STARS,
    APPSTORE_MAX_REVIEWS,
    PLAYWRIGHT_HEADLESS,
    PLAYWRIGHT_SLOW_MO,
    PLAYWRIGHT_TIMEOUT,
)

ITUNES_SEARCH_API = "https://itunes.apple.com/search"
ITUNES_REVIEWS_RSS = "https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby=mostrecent/json"
GP_REVIEWS_URL = "https://play.google.com/store/apps/details?id={package_id}&showAllReviews=true"


class AppStoreScraper(BaseScraper):
    def __init__(self):
        super().__init__("appstore")

    # ─────────────────────────────────────────────────────────────────────────
    # GOOGLE PLAY — usa la librería google-play-scraper
    # ─────────────────────────────────────────────────────────────────────────
    def _scrape_google_play(self, target: dict) -> list[dict]:
        """
        Extrae reseñas de Google Play usando google-play-scraper.
        Requiere: pip install google-play-scraper
        """
        try:
            from google_play_scraper import reviews, Sort
        except ImportError:
            print("[GooglePlay] Instala: pip install google-play-scraper")
            return []

        package_id = target.get("google_play_id")
        if not package_id:
            return []

        results = []
        print(f"[GooglePlay] Scrapeando '{target['name']}' ({package_id}) …")

        try:
            # Trae reseñas ordenadas por relevancia, filtra las malas
            result, _ = reviews(
                package_id,
                lang="en",
                country="us",
                sort=Sort.MOST_RELEVANT,
                count=APPSTORE_MAX_REVIEWS,
                filter_score_with=None,  # traemos todo y filtramos manualmente
            )

            for r in result:
                if r["score"] > APPSTORE_REVIEW_MAX_STARS:
                    continue
                results.append({
                    "source": "google_play",
                    "app_name": target["name"],
                    "app_id": package_id,
                    "rating": r["score"],
                    "review_title": r.get("reviewCreatedVersion", ""),
                    "review_text": (r.get("content") or "")[:2000],
                    "author": r.get("userName", ""),
                    "date": str(r.get("at", ""))[:10],
                    "thumbs_up": r.get("thumbsUpCount", 0),
                    "url": f"https://play.google.com/store/apps/details?id={package_id}",
                })

        except Exception as e:
            print(f"[GooglePlay] Error en '{target['name']}': {e}")

        print(f"[GooglePlay] '{target['name']}': {len(results)} reseñas negativas")
        return results

    # ─────────────────────────────────────────────────────────────────────────
    # APP STORE (iOS) — RSS feed de reseñas (gratuito, sin auth)
    # ─────────────────────────────────────────────────────────────────────────
    def _find_ios_app_id(self, app_name: str, country: str = "us") -> str | None:
        """Busca el App ID de iOS usando la iTunes Search API."""
        try:
            resp = requests.get(
                ITUNES_SEARCH_API,
                params={"term": app_name, "entity": "software", "country": country, "limit": 1},
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            if results:
                return str(results[0]["trackId"])
        except Exception as e:
            print(f"[AppStore] Error buscando ID de '{app_name}': {e}")
        return None

    def _scrape_appstore_rss(self, target: dict) -> list[dict]:
        """Extrae reseñas del App Store via RSS (sin browser, sin auth)."""
        app_id = target.get("ios_app_id") or self._find_ios_app_id(target["name"])
        if not app_id:
            print(f"[AppStore] No se encontró ID para '{target['name']}'")
            return []

        results = []
        country = target.get("country", "us")
        print(f"[AppStore] Scrapeando '{target['name']}' (ID: {app_id}) …")

        for page in range(1, 11):  # RSS tiene máx 10 páginas de 50 reseñas c/u
            url = ITUNES_REVIEWS_RSS.format(country=country, page=page, app_id=app_id)
            try:
                resp = requests.get(url, timeout=15)
                resp.raise_for_status()
                data = resp.json()

                entries = data.get("feed", {}).get("entry", [])
                if not entries:
                    break

                for entry in entries:
                    # La primera entry es metadata de la app, no una reseña
                    if "im:rating" not in entry:
                        continue

                    rating = int(entry.get("im:rating", {}).get("label", "5"))
                    if rating > APPSTORE_REVIEW_MAX_STARS:
                        continue

                    results.append({
                        "source": "app_store",
                        "app_name": target["name"],
                        "app_id": app_id,
                        "rating": rating,
                        "review_title": entry.get("title", {}).get("label", ""),
                        "review_text": entry.get("content", {}).get("label", "")[:2000],
                        "author": entry.get("author", {}).get("name", {}).get("label", ""),
                        "date": entry.get("updated", {}).get("label", "")[:10],
                        "vote_count": entry.get("im:voteCount", {}).get("label", "0"),
                        "url": entry.get("link", {}).get("attributes", {}).get("href", ""),
                    })

                if len(results) >= APPSTORE_MAX_REVIEWS:
                    break

                time.sleep(0.3)

            except Exception as e:
                print(f"[AppStore] Error en página {page}: {e}")
                break

        print(f"[AppStore] '{target['name']}': {len(results)} reseñas negativas")
        return results

    # ─────────────────────────────────────────────────────────────────────────
    # App Store — fallback con Playwright si el RSS falla
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_appstore_playwright(self, page: Page, target: dict) -> list[dict]:
        app_id = target.get("ios_app_id") or self._find_ios_app_id(target["name"])
        if not app_id:
            return []

        url = f"https://apps.apple.com/us/app/id{app_id}?see-all=reviews"
        results = []

        try:
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
            await page.wait_for_selector("[class*='we-customer-review']", timeout=PLAYWRIGHT_TIMEOUT)

            review_els = await page.query_selector_all("[class*='we-customer-review']")
            for el in review_els:
                stars_el = await el.query_selector("[class*='stars']")
                stars_label = await stars_el.get_attribute("aria-label") if stars_el else "5 stars"
                try:
                    rating = int(stars_label.split()[0])
                except (ValueError, IndexError):
                    rating = 5

                if rating > APPSTORE_REVIEW_MAX_STARS:
                    continue

                title_el = await el.query_selector("h3")
                title = (await title_el.inner_text()).strip() if title_el else ""

                body_el = await el.query_selector("p[class*='we-clamp']")
                body = (await body_el.inner_text()).strip() if body_el else ""

                results.append({
                    "source": "app_store",
                    "app_name": target["name"],
                    "app_id": app_id,
                    "rating": rating,
                    "review_title": title,
                    "review_text": body[:2000],
                    "url": url,
                })

        except Exception as e:
            print(f"[AppStore/Playwright] Error para '{target['name']}': {e}")

        return results

    # ─────────────────────────────────────────────────────────────────────────
    # RUNNER PRINCIPAL
    # ─────────────────────────────────────────────────────────────────────────
    async def _run_async(self, targets: list[dict] | None = None):
        targets = targets or APPSTORE_TARGETS
        self.results = []

        # Google Play (sin browser)
        for target in targets:
            if target.get("google_play_id"):
                self.results.extend(self._scrape_google_play(target))

        # App Store RSS (sin browser)
        pending_playwright: list[dict] = []
        for target in targets:
            if target.get("ios_app_id") or target.get("name"):
                rss_results = self._scrape_appstore_rss(target)
                if rss_results:
                    self.results.extend(rss_results)
                else:
                    pending_playwright.append(target)

        # Fallback Playwright para App Store
        if pending_playwright:
            async with async_playwright() as pw:
                browser = await pw.chromium.launch(
                    headless=PLAYWRIGHT_HEADLESS,
                    slow_mo=PLAYWRIGHT_SLOW_MO,
                )
                page = await (await browser.new_context()).new_page()

                for target in pending_playwright:
                    pw_results = await self._scrape_appstore_playwright(page, target)
                    print(f"[AppStore/Playwright] '{target['name']}': {len(pw_results)} reseñas")
                    self.results.extend(pw_results)

                await browser.close()

        self.save("appstore_reviews")
        return self.results

    def run(self, targets: list[dict] | None = None) -> list[dict]:
        return asyncio.run(self._run_async(targets))


if __name__ == "__main__":
    scraper = AppStoreScraper()
    scraper.run()
