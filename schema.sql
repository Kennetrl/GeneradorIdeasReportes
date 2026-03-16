-- ═══════════════════════════════════════════════════════════════════════════
-- ProblemFinder — Schema para Supabase (PostgreSQL + pgvector)
-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── SCRAPE RUNS (debe ir antes de insights por la FK) ───────────────────
CREATE TABLE IF NOT EXISTS scrape_runs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source          TEXT NOT NULL,
    status          TEXT DEFAULT 'running',
    items_found     INTEGER DEFAULT 0,
    items_new       INTEGER DEFAULT 0,
    error_message   TEXT,
    config_snapshot JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    finished_at     TIMESTAMPTZ
);

-- ─── INSIGHTS (tabla principal) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insights (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source          TEXT NOT NULL,
    content_type    TEXT NOT NULL DEFAULT 'pain_point',
    title           TEXT,
    body            TEXT NOT NULL,
    url             TEXT,
    source_date     DATE,
    rating          REAL,
    upvotes         INTEGER DEFAULT 0,
    comments_count  INTEGER DEFAULT 0,
    product_name    TEXT,
    pain_keywords   TEXT[] DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',
    embedding       vector(384),
    scrape_run_id   UUID REFERENCES scrape_runs(id),
    content_hash    TEXT UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_insights_source ON insights(source);
CREATE INDEX IF NOT EXISTS idx_insights_product ON insights(product_name);
CREATE INDEX IF NOT EXISTS idx_insights_content_type ON insights(content_type);
CREATE INDEX IF NOT EXISTS idx_insights_source_date ON insights(source_date);
CREATE INDEX IF NOT EXISTS idx_insights_rating ON insights(rating);
CREATE INDEX IF NOT EXISTS idx_insights_metadata ON insights USING GIN(metadata);

-- ─── FUNCIÓN DE BÚSQUEDA SEMÁNTICA (usada por el backend) ───────────────
CREATE OR REPLACE FUNCTION search_insights(
    query_embedding vector(384),
    match_count INT DEFAULT 20,
    filter_source TEXT DEFAULT NULL,
    filter_product TEXT DEFAULT NULL,
    filter_content_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source TEXT,
    content_type TEXT,
    title TEXT,
    body TEXT,
    url TEXT,
    source_date DATE,
    rating REAL,
    upvotes INTEGER,
    comments_count INTEGER,
    product_name TEXT,
    pain_keywords TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.source,
        i.content_type,
        i.title,
        i.body,
        i.url,
        i.source_date,
        i.rating,
        i.upvotes,
        i.comments_count,
        i.product_name,
        i.pain_keywords,
        i.metadata,
        i.created_at,
        1 - (i.embedding <=> query_embedding) AS similarity
    FROM insights i
    WHERE i.embedding IS NOT NULL
        AND (filter_source IS NULL OR i.source = filter_source)
        AND (filter_product IS NULL OR i.product_name = filter_product)
        AND (filter_content_type IS NULL OR i.content_type = filter_content_type)
    ORDER BY i.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ─── SAVED SEARCHES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_searches (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL,
    query_text      TEXT NOT NULL,
    filters         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
