"""
Review Scraper — La debilidad de la competencia
─────────────────────────────────────────────────
Extrae reseñas de 1-2 estrellas de Capterra, G2 y Trustpilot usando Playwright.

Qué extrae:
  - platform, product_name, rating, review_title, review_text, review_url, date

Configuración: edita REVIEW_TARGETS y REVIEW_MAX_STARS en config.py
"""

import asyncio
import re
from playwright.async_api import async_playwright, Page
from base_scraper import BaseScraper
from config import (
    REVIEW_TARGETS,
    REVIEW_MAX_STARS,
    REVIEW_MAX_PAGES,
    PLAYWRIGHT_HEADLESS,
    PLAYWRIGHT_SLOW_MO,
    PLAYWRIGHT_TIMEOUT,
)


class ReviewScraper(BaseScraper):
    def __init__(self):
        super().__init__("reviews")

    # ─────────────────────────────────────────────────────────────────────────
    # DISPATCHER — delega según la plataforma
    # ─────────────────────────────────────────────────────────────────────────
    async def scrape_target(self, page: Page, target: dict) -> list[dict]:
        platform = target["platform"].lower()
        dispatchers = {
            "g2": self._scrape_g2,
            "capterra": self._scrape_capterra,
            "trustpilot": self._scrape_trustpilot,
        }
        handler = dispatchers.get(platform)
        if not handler:
            print(f"[Reviews] Plataforma no soportada: {platform}")
            return []
        return await handler(page, target)

    # ─────────────────────────────────────────────────────────────────────────
    # G2
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_g2(self, page: Page, target: dict) -> list[dict]:
        results = []
        base_url = target["url"]

        for page_num in range(1, REVIEW_MAX_PAGES + 1):
            url = f"{base_url}?page={page_num}&filters%5Bstar_rating%5D%5B%5D=1&filters%5Bstar_rating%5D%5B%5D=2"
            print(f"[G2] {target['name']} — página {page_num}")
            try:
                await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
                await page.wait_for_selector("[itemprop='reviewBody']", timeout=PLAYWRIGHT_TIMEOUT)

                review_cards = await page.query_selector_all(".paper.paper--white.paper--box")

                if not review_cards:
                    break

                for card in review_cards:
                    # Rating
                    stars_el = await card.query_selector("[class*='stars']")
                    rating_text = await stars_el.get_attribute("class") if stars_el else ""
                    rating = self._extract_stars_g2(rating_text)

                    if rating > REVIEW_MAX_STARS:
                        continue

                    # Texto
                    body_el = await card.query_selector("[itemprop='reviewBody']")
                    body = await body_el.inner_text() if body_el else ""

                    title_el = await card.query_selector("[itemprop='name']")
                    title = await title_el.inner_text() if title_el else ""

                    date_el = await card.query_selector("time")
                    date = await date_el.get_attribute("datetime") if date_el else ""

                    link_el = await card.query_selector("a[href*='/reviews/']")
                    href = await link_el.get_attribute("href") if link_el else ""
                    review_url = f"https://www.g2.com{href}" if href.startswith("/") else href

                    results.append({
                        "source": "g2",
                        "product_name": target["name"],
                        "rating": rating,
                        "review_title": title.strip(),
                        "review_text": body.strip()[:2000],
                        "review_url": review_url,
                        "date": date,
                    })

            except Exception as e:
                print(f"[G2] Error en página {page_num}: {e}")
                break

        return results

    def _extract_stars_g2(self, class_str: str) -> float:
        """Extrae la calificación numérica de la clase CSS de G2 (ej. 'stars-1-half' → 1.5)."""
        match = re.search(r"stars-(\d+)(-half)?", class_str)
        if not match:
            return 5.0
        base = int(match.group(1))
        half = 0.5 if match.group(2) else 0.0
        return base + half

    # ─────────────────────────────────────────────────────────────────────────
    # CAPTERRA
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_capterra(self, page: Page, target: dict) -> list[dict]:
        results = []
        base_url = target["url"]

        for page_num in range(1, REVIEW_MAX_PAGES + 1):
            url = f"{base_url}?page={page_num}"
            print(f"[Capterra] {target['name']} — página {page_num}")
            try:
                await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
                await page.wait_for_selector("[data-testid='review-card']", timeout=PLAYWRIGHT_TIMEOUT)

                cards = await page.query_selector_all("[data-testid='review-card']")

                if not cards:
                    break

                for card in cards:
                    # Estrellas (atributo aria-label o data)
                    star_el = await card.query_selector("[data-testid='overall-rating']")
                    rating_text = await star_el.get_attribute("aria-label") if star_el else "5"
                    rating = self._extract_stars_capterra(rating_text)

                    if rating > REVIEW_MAX_STARS:
                        continue

                    title_el = await card.query_selector("h3")
                    title = await title_el.inner_text() if title_el else ""

                    body_el = await card.query_selector("[data-testid='review-text-body']")
                    body = await body_el.inner_text() if body_el else ""

                    date_el = await card.query_selector("time")
                    date = await date_el.inner_text() if date_el else ""

                    results.append({
                        "source": "capterra",
                        "product_name": target["name"],
                        "rating": rating,
                        "review_title": title.strip(),
                        "review_text": body.strip()[:2000],
                        "review_url": page.url,
                        "date": date.strip(),
                    })

            except Exception as e:
                print(f"[Capterra] Error en página {page_num}: {e}")
                break

        return results

    def _extract_stars_capterra(self, text: str) -> float:
        """Extrae número de estrella del aria-label (ej. '1 out of 5 stars' → 1.0)."""
        match = re.search(r"([\d.]+)", text)
        return float(match.group(1)) if match else 5.0

    # ─────────────────────────────────────────────────────────────────────────
    # TRUSTPILOT
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_trustpilot(self, page: Page, target: dict) -> list[dict]:
        results = []
        base_url = target["url"]

        for page_num in range(1, REVIEW_MAX_PAGES + 1):
            url = f"{base_url}?stars=1&stars=2&page={page_num}"
            print(f"[Trustpilot] {target['name']} — página {page_num}")
            try:
                await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
                await page.wait_for_selector("[data-service-review-card-paper]", timeout=PLAYWRIGHT_TIMEOUT)

                cards = await page.query_selector_all("[data-service-review-card-paper]")

                if not cards:
                    break

                for card in cards:
                    star_el = await card.query_selector("[data-service-review-rating]")
                    rating_str = await star_el.get_attribute("data-service-review-rating") if star_el else "5"
                    try:
                        rating = int(rating_str)
                    except (ValueError, TypeError):
                        rating = 5

                    if rating > REVIEW_MAX_STARS:
                        continue

                    title_el = await card.query_selector("[data-service-review-title-typography]")
                    title = await title_el.inner_text() if title_el else ""

                    body_el = await card.query_selector("[data-service-review-text-typography]")
                    body = await body_el.inner_text() if body_el else ""

                    date_el = await card.query_selector("time")
                    date = await date_el.get_attribute("datetime") if date_el else ""

                    link_el = await card.query_selector("a[href*='/reviews/']")
                    href = await link_el.get_attribute("href") if link_el else ""
                    review_url = f"https://www.trustpilot.com{href}" if href.startswith("/") else href

                    results.append({
                        "source": "trustpilot",
                        "product_name": target["name"],
                        "rating": rating,
                        "review_title": title.strip(),
                        "review_text": body.strip()[:2000],
                        "review_url": review_url,
                        "date": date,
                    })

            except Exception as e:
                print(f"[Trustpilot] Error en página {page_num}: {e}")
                break

        return results

    # ─────────────────────────────────────────────────────────────────────────
    # RUNNER PRINCIPAL
    # ─────────────────────────────────────────────────────────────────────────
    async def _run_async(self, targets: list[dict] | None = None):
        targets = targets or REVIEW_TARGETS
        self.results = []

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=PLAYWRIGHT_HEADLESS,
                slow_mo=PLAYWRIGHT_SLOW_MO,
            )
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            )
            page = await context.new_page()

            for target in targets:
                results = await self.scrape_target(page, target)
                self.results.extend(results)
                print(f"[Reviews] {target['name']} ({target['platform']}): {len(results)} reseñas negativas")

            await browser.close()

        self.save("competitor_reviews")
        return self.results

    def run(self, targets: list[dict] | None = None) -> list[dict]:
        return asyncio.run(self._run_async(targets))


if __name__ == "__main__":
    scraper = ReviewScraper()
    scraper.run()
