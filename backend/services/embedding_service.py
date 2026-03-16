"""
Servicio de embeddings — genera vectores con sentence-transformers
y los almacena en Supabase (pgvector).
"""

from sentence_transformers import SentenceTransformer
from backend.config import get_settings
from backend.database import get_supabase

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        settings = get_settings()
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def generate_embedding(text: str) -> list[float]:
    """Genera un embedding para un texto."""
    model = get_model()
    return model.encode(text).tolist()


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Genera embeddings en batch (más eficiente)."""
    model = get_model()
    return model.encode(texts).tolist()


def embed_pending_insights(batch_size: int = 100) -> int:
    """
    Busca insights sin embedding y los genera.
    Retorna la cantidad de insights procesados.
    """
    db = get_supabase()
    processed = 0

    while True:
        # Traer insights sin embedding
        result = (
            db.table("insights")
            .select("id, title, body")
            .is_("embedding", "null")
            .limit(batch_size)
            .execute()
        )

        rows = result.data
        if not rows:
            break

        texts = [f"{r.get('title', '') or ''} {r['body']}".strip() for r in rows]
        embeddings = generate_embeddings_batch(texts)

        for row, emb in zip(rows, embeddings):
            db.table("insights").update({"embedding": emb}).eq("id", row["id"]).execute()

        processed += len(rows)
        print(f"[Embeddings] Procesados: {processed}")

    return processed


if __name__ == "__main__":
    total = embed_pending_insights()
    print(f"[Embeddings] Total procesados: {total}")
