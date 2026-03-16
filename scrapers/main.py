"""
Orquestador principal — ejecuta todos los scrapers en secuencia.

Scrapers disponibles:
  reddit      → Posts con señales de dolor (PRAW, API oficial)
  reviews     → Reseñas 1-2★ de Capterra, G2, Trustpilot (Playwright)
  alt         → Cons y comentarios de AlternativeTo (BS4 + Playwright)
  hn          → Posts Ask HN / Show HN con pain points (Algolia API, sin auth)
  ph          → Productos y comentarios de Product Hunt (Playwright)
  apps        → Reseñas 1-2★ de App Store + Google Play

Uso:
  python main.py                         # corre los 6 scrapers
  python main.py --only reddit           # solo Reddit
  python main.py --only reviews          # solo Capterra/G2/Trustpilot
  python main.py --only alt              # solo AlternativeTo
  python main.py --only hn               # solo Hacker News
  python main.py --only ph               # solo Product Hunt
  python main.py --only apps             # solo App Store + Google Play
  python main.py --skip reddit ph        # todos excepto Reddit y PH
"""

import argparse
import json
import os
import pandas as pd
from datetime import datetime

from reddit_scraper import RedditScraper
from review_scraper import ReviewScraper
from alternativeto_scraper import AlternativeToScraper
from hackernews_scraper import HackerNewsScraper
from producthunt_scraper import ProductHuntScraper
from appstore_scraper import AppStoreScraper
from config import OUTPUT_DIR

ALL_SCRAPERS = ["reddit", "reviews", "alt", "hn", "ph", "apps"]


def parse_args():
    parser = argparse.ArgumentParser(
        description="GeneradorIDeasReportes — Scrapers de validación de ideas",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--only",
        nargs="+",
        choices=ALL_SCRAPERS,
        metavar="SCRAPER",
        help=f"Ejecuta solo estos scrapers: {ALL_SCRAPERS}",
    )
    group.add_argument(
        "--skip",
        nargs="+",
        choices=ALL_SCRAPERS,
        metavar="SCRAPER",
        help="Ejecuta todos excepto los indicados",
    )
    return parser.parse_args()


def should_run(name: str, args) -> bool:
    if args.only:
        return name in args.only
    if args.skip:
        return name not in args.skip
    return True


def merge_results(all_results: list[dict]) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    json_path = os.path.join(OUTPUT_DIR, f"all_insights_{timestamp}.json")
    csv_path = os.path.join(OUTPUT_DIR, f"all_insights_{timestamp}.csv")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    if all_results:
        pd.DataFrame(all_results).to_csv(csv_path, index=False, encoding="utf-8-sig")

    print(f"\n{'='*60}")
    print(f"CONSOLIDADO: {len(all_results)} registros totales")
    print(f"  JSON → {json_path}")
    print(f"  CSV  → {csv_path}")
    print(f"{'='*60}")
    return json_path


def print_summary(all_results: list[dict]):
    by_source: dict[str, int] = {}
    for r in all_results:
        src = r.get("source", "unknown")
        by_source[src] = by_source.get(src, 0) + 1

    print("\n─── RESUMEN POR FUENTE ─────────────────────────────────")
    for src, count in sorted(by_source.items()):
        bar = "█" * min(count // 2, 40)
        print(f"  {src:<18} {count:>4}  {bar}")
    print("────────────────────────────────────────────────────────\n")


def main():
    args = parse_args()
    all_results: list[dict] = []

    steps = [
        ("reddit",  "Reddit — Posts con señales de dolor",         RedditScraper),
        ("reviews", "Capterra/G2/Trustpilot — Reseñas negativas",  ReviewScraper),
        ("alt",     "AlternativeTo — Cons y comentarios de users", AlternativeToScraper),
        ("hn",      "Hacker News — Ask HN / Show HN insights",     HackerNewsScraper),
        ("ph",      "Product Hunt — Productos y feedback",         ProductHuntScraper),
        ("apps",    "App Store + Google Play — Reseñas negativas", AppStoreScraper),
    ]

    total = sum(1 for name, _, _ in steps if should_run(name, args))
    current = 0

    for name, label, ScraperClass in steps:
        if not should_run(name, args):
            continue

        current += 1
        print(f"\n[{current}/{total}] {label}")
        print("─" * 56)

        try:
            scraper = ScraperClass()
            results = scraper.run()
            all_results.extend(results)
        except Exception as e:
            print(f"  ERROR en {name}: {e}")

    if all_results:
        merge_results(all_results)
        print_summary(all_results)
    else:
        print("\nNo se encontraron resultados.")
        print("Verifica tu config.py y que las credenciales de Reddit estén en .env")


if __name__ == "__main__":
    main()
