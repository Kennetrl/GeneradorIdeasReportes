"""
Servicio LLM — usa Groq para generar análisis, ideas y reportes
a partir de los pain points recolectados.
"""

from groq import Groq
from backend.config import get_settings
from backend.services.search_service import semantic_search, filtered_search

_client: Groq | None = None

DEFAULT_MODEL = "llama-3.3-70b-versatile"


def get_groq() -> Groq:
    global _client
    if _client is None:
        settings = get_settings()
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def _call_groq(prompt: str, model: str | None = None) -> dict:
    """Llamada base a Groq."""
    client = get_groq()
    response = client.chat.completions.create(
        model=model or DEFAULT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000,
    )
    return {
        "content": response.choices[0].message.content,
        "model": response.model,
    }


def _build_context(insights: list[dict]) -> str:
    """Construye contexto a partir de insights para el prompt."""
    lines = []
    for i, r in enumerate(insights, 1):
        source = r.get("source", "?")
        title = r.get("title", "")
        body = r.get("body", "")[:300]
        upvotes = r.get("upvotes", 0)
        text = f"{title}: {body}" if title else body
        lines.append(f"{i}. [{source}] (upvotes: {upvotes}) {text}")
    return "\n".join(lines)


def summarize(
    query: str | None = None,
    insight_ids: list[str] | None = None,
    source: str | None = None,
    product_name: str | None = None,
    limit: int = 15,
) -> dict:
    """Resume los pain points encontrados."""
    if query:
        insights = semantic_search(query, source=source, product_name=product_name, limit=limit)
    else:
        insights = filtered_search(source=source, product_name=product_name, limit=limit)

    if not insights:
        return {"content": "No se encontraron insights para analizar.", "model": "", "sources_used": 0}

    context = _build_context(insights)
    prompt = f"""Analiza estos {len(insights)} pain points reales de usuarios recopilados de múltiples fuentes (Reddit, Hacker News, reviews de apps, etc.):

{context}

Genera un resumen ejecutivo en español que incluya:
1. **Principales problemas detectados** — agrupa por tema
2. **Frecuencia e intensidad** — qué tan mencionado y frustrante es cada problema
3. **Patrones** — tendencias o temas recurrentes
4. **Oportunidades** — dónde hay un gap claro que se podría llenar

Sé conciso y directo. Usa datos del contexto para respaldar cada punto."""

    result = _call_groq(prompt)
    result["sources_used"] = len(insights)
    return result


def generate_ideas(
    query: str | None = None,
    product_name: str | None = None,
    limit: int = 15,
) -> dict:
    """Genera ideas de producto/SaaS basadas en pain points reales."""
    if query:
        insights = semantic_search(query, product_name=product_name, limit=limit)
    elif product_name:
        insights = filtered_search(product_name=product_name, limit=limit)
    else:
        insights = filtered_search(limit=limit)

    if not insights:
        return {"content": "No se encontraron insights para generar ideas.", "model": "", "sources_used": 0}

    context = _build_context(insights)
    prompt = f"""Basándote en estos {len(insights)} pain points REALES de usuarios (no inventados, extraídos de Reddit, HN, reviews, etc.):

{context}

Genera 5 ideas de producto/SaaS que resuelvan estos problemas. Para cada idea incluye:
1. **Nombre sugerido**
2. **Problema que resuelve** (referencia los pain points específicos)
3. **Descripción en una línea**
4. **Por qué ahora** (timing, tendencias)
5. **Modelo de monetización**
6. **Complejidad de MVP** (baja/media/alta)

Prioriza ideas con:
- Problemas mencionados por múltiples usuarios
- Alto engagement (upvotes) en los posts originales
- Gaps claros donde no hay solución actual"""

    result = _call_groq(prompt)
    result["sources_used"] = len(insights)
    return result


def generate_report(
    product_name: str,
    sources: list[str] | None = None,
) -> dict:
    """Genera un reporte completo de un producto/competidor."""
    insights = filtered_search(product_name=product_name, limit=30)

    if sources:
        insights = [i for i in insights if i.get("source") in sources]

    if not insights:
        return {"content": f"No se encontraron datos sobre '{product_name}'.", "model": "", "sources_used": 0}

    context = _build_context(insights)
    prompt = f"""Genera un reporte de análisis competitivo completo para "{product_name}" basado en estos {len(insights)} datos reales de usuarios:

{context}

Estructura del reporte:

## Análisis de {product_name}

### 1. Resumen General
Visión general del sentimiento y problemas detectados.

### 2. Problemas Principales (Top 5)
Los problemas más frecuentes y graves, con evidencia de los datos.

### 3. Debilidades Clave
Qué hace mal este producto según los usuarios.

### 4. Lo Que Los Usuarios Piden
Features o mejoras que los usuarios mencionan explícitamente.

### 5. Oportunidades Para Competir
Dónde hay espacio para un producto alternativo.

### 6. Recomendaciones
Acciones concretas si quisieras construir un competidor.

Usa datos específicos del contexto. Sé directo y accionable."""

    result = _call_groq(prompt)
    result["sources_used"] = len(insights)
    return result
