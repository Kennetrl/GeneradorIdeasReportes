"""
Clase base con utilidades compartidas entre todos los scrapers.
"""

import json
import os
import pandas as pd
from datetime import datetime
from config import OUTPUT_DIR


class BaseScraper:
    def __init__(self, name: str):
        self.name = name
        self.results: list[dict] = []
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    def save(self, filename: str | None = None) -> str:
        """Guarda los resultados en JSON y CSV dentro de OUTPUT_DIR."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base = filename or f"{self.name}_{timestamp}"

        json_path = os.path.join(OUTPUT_DIR, f"{base}.json")
        csv_path = os.path.join(OUTPUT_DIR, f"{base}.csv")

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)

        if self.results:
            pd.DataFrame(self.results).to_csv(csv_path, index=False, encoding="utf-8-sig")

        print(f"[{self.name}] {len(self.results)} resultados → {json_path} | {csv_path}")
        return json_path

    def _contains_keywords(self, text: str, keywords: list[str]) -> bool:
        """Devuelve True si el texto contiene alguna de las palabras clave (case-insensitive)."""
        text_lower = text.lower()
        return any(kw.lower() in text_lower for kw in keywords)

    def _matched_keywords(self, text: str, keywords: list[str]) -> list[str]:
        """Devuelve la lista de palabras clave encontradas en el texto."""
        text_lower = text.lower()
        return [kw for kw in keywords if kw.lower() in text_lower]
