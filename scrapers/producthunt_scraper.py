"""
Product Hunt Scraper — Tendencias y feedback de early adopters
───────────────────────────────────────────────────────────────
Extrae productos de un topic/categoría y sus comentarios.

Por qué es valioso:
  - Los productos con muchos upvotes validan que el problema tiene demanda
  - Los comentarios negativos revelan lo que falta (tu oportunidad)
  - "What would make this better?" → requerimientos gratuitos de tu MVP

Qué extrae:
  - name, tagline, description, votes, comments_count, url, topics
  - comments: texto + votos de cada comentario del producto

Stack: Playwright (contenido dinámico con React)
"""

import asyncio
import re
from playwright.async_api import async_playwright, Page
from base_scraper import BaseScraper
from config import (
    PH_TOPICS,
    PH_MIN_VOTES,
    PH_MAX_PRODUCTS,
    PH_SCRAPE_COMMENTS,
    PLAYWRIGHT_HEADLESS,
    PLAYWRIGHT_SLOW_MO,
    PLAYWRIGHT_TIMEOUT,
)

PH_BASE = "https://www.producthunt.com"


class ProductHuntScraper(BaseScraper):
    def __init__(self):
        super().__init__("producthunt")

    # ─────────────────────────────────────────────────────────────────────────
    # Lista de productos por topic
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_topic(self, page: Page, topic: str) -> list[dict]:
        url = f"{PH_BASE}/topics/{topic}"
        products = []

        print(f"[ProductHunt] Topic: {topic} → {url}")
        try:
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
            await page.wait_for_selector("[data-test='post-item']", timeout=PLAYWRIGHT_TIMEOUT)

            # Scroll para cargar más productos
            prev_count = 0
            for _ in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1500)
                cards = await page.query_selector_all("[data-test='post-item']")
                if len(cards) >= PH_MAX_PRODUCTS or len(cards) == prev_count:
                    break
                prev_count = len(cards)

            cards = await page.query_selector_all("[data-test='post-item']")
            print(f"[ProductHunt] {len(cards)} productos encontrados en '{topic}'")

            for card in cards[:PH_MAX_PRODUCTS]:
                try:
                    name_el = await card.query_selector("[class*='color-lighter-grey'] ~ * h3, h3")
                    name = (await name_el.inner_text()).strip() if name_el else ""

                    tagline_el = await card.query_selector("[class*='tagline'], p[class*='color']")
                    tagline = (await tagline_el.inner_text()).strip() if tagline_el else ""

                    votes_el = await card.query_selector("[data-test='vote-button']")
                    votes_text = (await votes_el.inner_text()).strip() if votes_el else "0"
                    votes = self._parse_number(votes_text)

                    if votes < PH_MIN_VOTES:
                        continue

                    link_el = await card.query_selector("a[href*='/posts/']")
                    href = await link_el.get_attribute("href") if link_el else ""
                    product_url = f"{PH_BASE}{href}" if href.startswith("/") else href

                    products.append({
                        "source": "producthunt",
                        "type": "product",
                        "topic": topic,
                        "name": name,
                        "tagline": tagline,
                        "votes": votes,
                        "url": product_url,
                    })

                except Exception as e:
                    print(f"[ProductHunt] Error parseando card: {e}")

        except Exception as e:
            print(f"[ProductHunt] Error cargando topic '{topic}': {e}")

        return products

    # ─────────────────────────────────────────────────────────────────────────
    # Comentarios de un producto específico
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_comments(self, page: Page, product: dict) -> list[dict]:
        comments = []
        url = product["url"]

        try:
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)
            await page.wait_for_selector("[data-test='discussion-item']", timeout=PLAYWRIGHT_TIMEOUT)

            comment_els = await page.query_selector_all("[data-test='discussion-item']")

            for el in comment_els:
                body_el = await el.query_selector("[class*='body'], p")
                body = (await body_el.inner_text()).strip() if body_el else ""

                if len(body) < 30:
                    continue

                votes_el = await el.query_selector("[class*='vote'], [data-test='vote']")
                votes_text = (await votes_el.inner_text()).strip() if votes_el else "0"

                comments.append({
                    "source": "producthunt",
                    "type": "comment",
                    "topic": product.get("topic", ""),
                    "product_name": product["name"],
                    "text": body[:2000],
                    "votes": self._parse_number(votes_text),
                    "url": url,
                })

        except Exception as e:
            print(f"[ProductHunt] Sin comentarios en {url}: {e}")

        return comments

    def _parse_number(self, text: str) -> int:
        """Convierte '1.2K' → 1200, '500' → 500."""
        text = text.strip().upper().replace(",", "")
        match = re.search(r"([\d.]+)([KM]?)", text)
        if not match:
            return 0
        num = float(match.group(1))
        suffix = match.group(2)
        if suffix == "K":
            num *= 1000
        elif suffix == "M":
            num *= 1_000_000
        return int(num)

    # ─────────────────────────────────────────────────────────────────────────
    # RUNNER PRINCIPAL
    # ─────────────────────────────────────────────────────────────────────────
    async def _run_async(
        self,
        topics: list[str] | None = None,
        scrape_comments: bool | None = None,
    ):
        topics = topics or PH_TOPICS
        scrape_comments = scrape_comments if scrape_comments is not None else PH_SCRAPE_COMMENTS
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

            all_products = []
            for topic in topics:
                products = await self._scrape_topic(page, topic)
                all_products.extend(products)
                self.results.extend(products)
                print(f"[ProductHunt] '{topic}': {len(products)} productos con ≥{PH_MIN_VOTES} votos")

            # Scrapear comentarios de cada producto
            if scrape_comments:
                for product in all_products:
                    comments = await self._scrape_comments(page, product)
                    self.results.extend(comments)
                    print(f"[ProductHunt] '{product['name']}': {len(comments)} comentarios")
                    await page.wait_for_timeout(800)

            await browser.close()

        self.save("producthunt_insights")
        return self.results

    def run(self, **kwargs) -> list[dict]:
        return asyncio.run(self._run_async(**kwargs))


if __name__ == "__main__":
    scraper = ProductHuntScraper()
    scraper.run()
