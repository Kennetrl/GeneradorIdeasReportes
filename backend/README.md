# Backend - API FastAPI 🔧

API RESTful construida con **FastAPI** que proporciona servicios de búsqueda semántica, análisis con IA y orquestación de scrapers.

## 📋 Características

- **Búsqueda Semántica**: Embeddings vectoriales con pgvector
- **Análisis con IA**: Groq API para generación de ideas y reportes
- **Gestión de Base de Datos**: Supabase PostgreSQL
- **Documentación Interactiva**: Swagger UI en `/docs`
- **CORS Habilitado**: Acepta requests desde cualquier origen
- **Modular**: Routers, servicios y schemas organizados

## 🚀 Inicio Rápido

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d backend

# Backend estará en: http://localhost:8000
```

### Manual

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
# Copiar .env.example a .env y rellenar credenciales

# 4. Ejecutar servidor
uvicorn main:app --reload

# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

## 📁 Estructura

```
backend/
├── main.py                       # Punto de entrada FastAPI
├── config.py                     # Configuración (Pydantic)
├── database.py                   # Cliente Supabase
├── requirements.txt              # Dependencias Python
├── models/                       # Modelos de datos
├── routers/                      # Rutas/endpoints
│   ├── insights.py              # GET insights, filtros, stats
│   ├── search.py                # POST búsqueda semántica
│   ├── scraper.py               # POST ejecutar scrapers
│   └── llm.py                   # POST análisis con IA
├── schemas/                      # Pydantic request/response
│   ├── insight.py
│   ├── search.py                # SearchRequest
│   └── llm.py                   # LLM requests
├── services/                     # Lógica de negocio
│   ├── embedding_service.py      # Generador de embeddings
│   ├── search_service.py         # Búsqueda semántica
│   ├── llm_service.py           # Llamadas a Groq
│   └── scraper_service.py        # Normalización de datos
└── utils/
    └── text.py                   # Utilidades de texto
```

## 🔌 API Endpoints

### Insights

```bash
# Listar todos los insights
GET /api/v1/insights
  ?source=reddit&content_type=pain_point&limit=20&offset=0

# Estadísticas agregadas
GET /api/v1/insights/stats

# Detalle de insight
GET /api/v1/insights/{id}
```

### Búsqueda

```bash
# Búsqueda semántica
POST /api/v1/search
Content-Type: application/json
{
  "query": "problemas con gestión de proyectos",
  "match_count": 10,
  "filter_source": "reddit",
  "filter_product": "notion"
}
```

### LLM (Análisis)

```bash
# Resumir pain points
POST /api/v1/llm/summarize
{
  "insights": ["insight 1", "insight 2"]
}

# Generar ideas de producto
POST /api/v1/llm/ideas
{
  "pain_points": ["falta de integración", "UI compleja"],
  "market": "SaaS"
}

# Generar reporte competitivo
POST /api/v1/llm/report
{
  "product": "Notion",
  "insights": ["..."]
}
```

### Scrapers

```bash
# Ejecutar scrapers
POST /api/v1/scraper/run
{
  "scrapers": ["reddit", "hn", "ph"]
}

# Historial de scrapes
GET /api/v1/scraper/runs
```

## 🔑 Variables de Entorno

```env
# ─── SUPABASE ─────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# ─── GROQ ────────────────────────────────────────────────────────────────
GROQ_API_KEY=your_groq_api_key

# ─── DATABASE ─────────────────────────────────────────────────────────────
# Estos se obtienen de Supabase
EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
```

## 🛠️ Stack Tecnológico

| Componente | Versión |
|-----------|---------|
| FastAPI | >=0.115.0 |
| Uvicorn | >=0.34.0 |
| Pydantic | >=2.0.0 |
| PostgreSQL | via Supabase |
| pgvector | extension |
| sentence-transformers | >=3.0.0 |
| Groq | >=0.11.0 |
| httpx | >=0.28.0 |

## 🔍 Servicios Principales

### EmbeddingService
Genera embeddings vectoriales 384-dimensional usando `all-MiniLM-L6-v2`:
```python
from services.embedding_service import EmbeddingService

service = EmbeddingService()
embedding = service.embed_text("texto a vectorizar")
# [0.123, -0.456, ...] (384 dims)
```

### SearchService
Búsqueda semántica con pgvector + filtros:
```python
results = search_service.semantic_search(
    query_embedding=embedding,
    match_count=10,
    filter_source="reddit",
    filter_product="notion"
)
```

### LLMService
Análisis con Groq API:
```python
ideas = llm_service.generate_ideas(pain_points, market)
report = llm_service.generate_report(product, insights)
```

### ScraperService
Normalización de datos de scrapers:
```python
normalized = scraper_service.normalize_insight(raw_insight)
# Mapea a esquema unified de insights table
```

## 📊 Database Schema

**Tabla: insights**
- `id` (UUID) - Primary key
- `source` (TEXT) - reddit, review, alternativeto, hackernews, producthunt, appstore
- `content_type` (TEXT) - pain_point, review
- `title` (TEXT) - Titular
- `body` (TEXT) - Contenido completo
- `url` (TEXT) - Link original
- `source_date` (DATE) - Fecha en fuente original
- `rating` (REAL) - 1-5 estrellas
- `upvotes` (INT) - Votos/likes
- `comments_count` (INT) - Comentarios
- `product_name` (TEXT) - Producto mencionado
- `pain_keywords` (TEXT[]) - Palabras clave extraídas
- `embedding` (vector(384)) - Vector pgvector
- `metadata` (JSONB) - Datos adicionales por fuente
- `created_at` (TIMESTAMPTZ) - Timestamp

**Tabla: scrape_runs**
- `id` (UUID)
- `source` (TEXT)
- `status` (TEXT) - running, completed, failed
- `items_found`, `items_new` (INT)
- `started_at`, `finished_at` (TIMESTAMPTZ)

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Con coverage
pytest --cov=.

# Tests específicos
pytest tests/test_search_service.py -v
```

## 📚 Documentación

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐳 Docker

```bash
# Construir imagen
docker build -t backend:latest .

# Ejecutar contenedor
docker run -p 8000:8000 --env-file .env backend:latest

# Con docker-compose
docker-compose up backend
```

## 🔐 Seguridad

- ✅ CORS configurado para producción (cambiar `*`)
- ✅ API keys en .env (nunca en código)
- ✅ Validación con Pydantic
- ✅ Errores sin exponer detalles internos

## 🚨 Troubleshooting

**Error: "SUPABASE_URL not found"**
```bash
# Asegúrate de que .env existe en la raíz
echo "SUPABASE_URL=..." > .env
```

**Error: "Connection refused port 8000"**
```bash
# El puerto 8000 está en uso
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

**Error: "pgvector extension not enabled"**
- Habilita en Supabase: Extensiones → vector → Habilitar

## 📖 Referencias

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Groq API](https://console.groq.com/docs)
- [sentence-transformers](https://www.sbert.net)
