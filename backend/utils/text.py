"""
Utilidades de procesamiento de texto.
"""

import hashlib
import re


def clean_text(text: str) -> str:
    """Limpia HTML, normaliza espacios y trunca."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def content_hash(source: str, url: str, body: str) -> str:
    """Genera hash SHA256 para deduplicación."""
    raw = f"{source}|{url or ''}|{body[:500]}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def truncate(text: str, max_length: int = 2000) -> str:
    """Trunca texto a un máximo de caracteres."""
    if len(text) <= max_length:
        return text
    return text[:max_length].rsplit(" ", 1)[0] + "…"
