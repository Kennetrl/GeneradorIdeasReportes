"""
AlternativeTo Scraper — Validación del MVP
───────────────────────────────────────────
Extrae los "Cons" y comentarios de usuarios de AlternativeTo.net.

La gente llega a esta página cuando ya se hartó de una herramienta.
Los "Cons" te dan los requerimientos exactos que debe cubrir tu MVP.

Qué extrae:
  - tool_name, con_text, comment_text, source_url

Configuración: edita ALTERNATIVETO_TARGETS en config.py
"""

import asyncio
from playwright.async_api import async_playwright, Page
from bs4 import BeautifulSoup
import requests

from base_scraper import BaseScraper
from config import (
    ALTERNATIVETO_TARGETS,
    PLAYWRIGHT_HEADLESS,
    PLAYWRIGHT_SLOW_MO,
    PLAYWRIGHT_TIMEOUT,
)

ALTERNATIVETO_BASE = "https://alternativeto.net/software"


class AlternativeToScraper(BaseScraper):
    def __init__(self):
        super().__init__("alternativeto")

    # ─────────────────────────────────────────────────────────────────────────
    # Intenta con requests+BS4 (más rápido); si falla cae a Playwright
    # ─────────────────────────────────────────────────────────────────────────
    def _scrape_static(self, target: dict) -> list[dict] | None:
        """Intento rápido con requests + BeautifulSoup."""
        url = f"{ALTERNATIVETO_BASE}/{target['slug']}/"
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            results = []

            # ── Cons (lista de desventajas) ───────────────────────────────────
            # AlternativeTo lista los "Cons" en una sección etiquetada
            for section in soup.find_all(["section", "div"]):
                heading = section.find(["h2", "h3", "h4"])
                if heading and "con" in heading.get_text(strip=True).lower():
                    for li in section.find_all("li"):
                        text = li.get_text(strip=True)
                        if text:
                            results.append({
                                "source": "alternativeto",
                                "tool_name": target["name"],
                                "type": "con",
                                "text": text,
                                "url": url,
                            })

            # ── Comentarios de usuarios ────────────────────────────────────────
            for comment_el in soup.select("[class*='comment'], [class*='review']"):
                text = comment_el.get_text(separator=" ", strip=True)
                if len(text) > 40:  # filtrar ruido
                    results.append({
                        "source": "alternativeto",
                        "tool_name": target["name"],
                        "type": "comment",
                        "text": text[:2000],
                        "url": url,
                    })

            if results:
                return results

        except Exception as e:
            print(f"[AlternativeTo] Static scrape falló para {target['name']}: {e}")

        return None  # señal para usar Playwright

    # ─────────────────────────────────────────────────────────────────────────
    # Playwright — fallback para contenido dinámico
    # ─────────────────────────────────────────────────────────────────────────
    async def _scrape_dynamic(self, page: Page, target: dict) -> list[dict]:
        url = f"{ALTERNATIVETO_BASE}/{target['slug']}/"
        results = []

        print(f"[AlternativeTo] Playwright → {target['name']} ({url})")

        try:
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT)

            # Espera a que cargue algo relevante
            await page.wait_for_selector(
                "[class*='pros'], [class*='cons'], [class*='comment'], [class*='review']",
                timeout=PLAYWRIGHT_TIMEOUT,
            )

            # ── Cons ────────────────────────────────────────────────────────────
            con_selectors = [
                "[class*='cons'] li",
                "[class*='con-'] li",
                "[data-type='con']",
                "li[class*='negat']",
            ]
            for sel in con_selectors:
                elements = await page.query_selector_all(sel)
                for el in elements:
                    text = (await el.inner_text()).strip()
                    if text:
                        results.append({
                            "source": "alternativeto",
                            "tool_name": target["name"],
                            "type": "con",
                            "text": text,
                            "url": url,
                        })

            # ── Comentarios ─────────────────────────────────────────────────────
            comment_selectors = [
                "[class*='comment__body']",
                "[class*='review-text']",
                "[class*='userComment']",
                "p[class*='comment']",
            ]
            for sel in comment_selectors:
                elements = await page.query_selector_all(sel)
                for el in elements:
                    text = (await el.inner_text()).strip()
                    if len(text) > 40:
                        results.append({
                            "source": "alternativeto",
                            "tool_name": target["name"],
                            "type": "comment",
                            "text": text[:2000],
                            "url": url,
                        })

        except Exception as e:
            print(f"[AlternativeTo] Error Playwright en {target['name']}: {e}")

        return results

    # ─────────────────────────────────────────────────────────────────────────
    # RUNNER PRINCIPAL
    # ─────────────────────────────────────────────────────────────────────────
    async def _run_async(self, targets: list[dict] | None = None):
        targets = targets or ALTERNATIVETO_TARGETS
        self.results = []

        # Primero intento estático (sin browser, más rápido)
        pending_dynamic = []
        for target in targets:
            static_results = self._scrape_static(target)
            if static_results:
                print(f"[AlternativeTo] {target['name']} (static): {len(static_results)} items")
                self.results.extend(static_results)
            else:
                pending_dynamic.append(target)

        # Para los que fallaron, usa Playwright
        if pending_dynamic:
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

                for target in pending_dynamic:
                    dynamic_results = await self._scrape_dynamic(page, target)
                    print(f"[AlternativeTo] {target['name']} (dynamic): {len(dynamic_results)} items")
                    self.results.extend(dynamic_results)

                await browser.close()

        self.save("alternativeto_cons")
        return self.results

    def run(self, targets: list[dict] | None = None) -> list[dict]:
        return asyncio.run(self._run_async(targets))


if __name__ == "__main__":
    scraper = AlternativeToScraper()
    scraper.run()
