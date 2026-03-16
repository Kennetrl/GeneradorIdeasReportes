# GeneradorIDeasReportes 🚀

Plataforma integral para **descubrir problemas reales**, **generar ideas validadas** y **analizar reportes competitivos** usando IA y análisis de datos de múltiples fuentes.

## 📋 Características

- **6 fuentes de datos**: Reddit, reseñas (Capterra/G2/Trustpilot), AlternativeTo, Hacker News, Product Hunt, App Stores
- **Búsqueda semántica**: Embeddings vectoriales con pgvector
- **Análisis con IA**: Generación de ideas y reportes con Groq API
- **Interfaz moderna**: Next.js 14 con Tailwind CSS y shadcn/ui
- **API RESTful**: FastAPI con Supabase PostgreSQL
- **Totalmente dockerizado**: Levanta con un comando

## 🏗️ Arquitectura

```
GeneradorIDeasReportes/
├── backend/          # FastAPI (Python) - API y servicios
├── frontend/         # Next.js 14 (React) - UI moderna
├── scrapers/         # Orquestador de datos (Python)
├── data/             # Archivos de salida (ignorados en git)
├── docker-compose.yml # Compose principal
└── schema.sql        # Schema de base de datos
```

## 🚀 Inicio Rápido

**⚡ Ver [QUICKSTART.md](QUICKSTART.md) para instrucciones paso a paso**

### Con Docker (Recomendado)

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env

# 2. Edita .env con tus credenciales de Supabase y Groq
# SUPABASE_URL=https://...
# GROQ_API_KEY=gsk_...

# 3. Levanta todo
docker-compose up -d

# Frontend: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Manual (Desarrollo)

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend (otra terminal)
cd frontend && npm install && echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local && npm run dev

# Scrapers
cd scrapers && pip install -r requirements.txt && python main.py
```

Ver documentación detallada:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Scrapers README](scrapers/README.md)

## 🔑 Variables de Entorno

Crear `.env` en la raíz (basado en `.env.example`):

```env
# ─── SUPABASE ─────────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# ─── GROQ ─────────────────────────────────────────────────────────────────────
GROQ_API_KEY=your_groq_key

# ─── FRONTEND ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📖 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/insights` | Lista problemas con filtros |
| GET | `/api/v1/insights/{id}` | Detalle de un problema |
| GET | `/api/v1/insights/stats` | Estadísticas agregadas |
| POST | `/api/v1/search` | Búsqueda semántica |
| POST | `/api/v1/llm/ideas` | Genera ideas de producto |
| POST | `/api/v1/llm/report` | Genera reporte competitivo |
| POST | `/api/v1/scraper/run` | Ejecuta scrapers |
| GET | `/api/v1/scraper/runs` | Historial de scrapes |

Documentación interactiva: http://localhost:8000/docs

## 📱 Páginas del Frontend

- `/` - Dashboard con estadísticas
- `/explorer` - Explorador avanzado de problemas
- `/insights/[id]` - Detalle de problema
- `/ideas` - Generador de ideas
- `/reports` - Reportes competitivos
- `/scraper` - Panel de control de scrapers

## 🛠️ Stack Tecnológico

| Componente | Tech |
|-----------|------|
| **Backend** | FastAPI, Python 3.8+, Supabase PostgreSQL, pgvector |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Scrapers** | BeautifulSoup4, Playwright, google-play-scraper |
| **LLM** | Groq (llama-3.3-70b-versatile) |
| **Embeddings** | sentence-transformers (all-MiniLM-L6-v2) |
| **Database** | PostgreSQL con pgvector extension |
| **Containerización** | Docker, docker-compose |

## 📊 Fuentes de Datos

1. **Reddit** - Posts públicos con palabras clave de dolor
2. **Reseñas** - Capterra, G2, Trustpilot (1-2 estrellas)
3. **AlternativeTo** - Contras de herramientas
4. **Hacker News** - Ask HN/Show HN threads
5. **Product Hunt** - Productos y comentarios
6. **App Stores** - iOS App Store y Google Play reviews

## 🔄 Flujo de Datos

```
Scrapers → Normalize → Supabase
    ↓
Embeddings (sentence-transformers)
    ↓
pgvector Search
    ↓
Backend Services (LLM, Search, Analysis)
    ↓
FastAPI Routes
    ↓
Next.js Frontend
```

## 🗄️ Base de Datos

- Tabla `insights` - Problemas/pain points
- Tabla `scrape_runs` - Historial de scrapes
- Tabla `saved_searches` - Búsquedas guardadas
- Índices en source, product_name, content_type, rating
- RPC `search_insights()` - Búsqueda semántica con pgvector

## 🐳 Docker

```bash
# Construir todas las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## 📝 Git & .gitignore

### ⚠️ Frontend .git Anidado

**Acción necesaria**: Eliminar el `.git` anidado del frontend

```bash
rmdir /s /q frontend\.git
git add frontend/
git commit -m "Integrate frontend into main repository"
git push origin main
```

Ver detalles en [GIT_SETUP.md](GIT_SETUP.md)

### Estructura de .gitignore

Cada carpeta tiene `.gitignore` personalizado:

- **Root** - Ignora `.env`, `data/`, `venv/`, `node_modules/`
- **Backend** - Ignora `__pycache__`, `.pyc`, `.coverage`
- **Frontend** - Ignora `.next/`, `node_modules/`, `.env.local`
- **Scrapers** - Ignora `browsers/`, `.playwright/`, `data/`

Archivos ignorados en producción:
- ✅ Variables secretas (`.env`)
- ✅ Dependencias descargadas
- ✅ Archivos compilados
- ✅ Logs y datos temporales

## 🤝 Contribuciones

1. Fork del proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit (`git commit -m 'Agrega mejora'`)
4. Push (`git push origin feature/mejora`)
5. Pull Request

## 📄 Licencia

MIT License - Ver LICENSE

## 👤 Autor

Kennet - ProyectosGit

## 📞 Soporte

- 📖 [QUICKSTART.md](QUICKSTART.md) - Inicio rápido
- 📖 [GIT_SETUP.md](GIT_SETUP.md) - Resolver problemas de git
- 📖 [Backend README](backend/README.md) - API y servicios
- 📖 [Frontend README](frontend/README.md) - UI y componentes
- 📖 [Scrapers README](scrapers/README.md) - Recolección de datos
- 🔗 API Docs: http://localhost:8000/docs
- 💬 Issues: GitHub Issues

## 🎯 Próximos Pasos

1. ✅ Levanta el proyecto
2. ✅ Explora el dashboard en http://localhost:3000
3. ✅ Configura Supabase y Groq
4. ✅ Ejecuta los scrapers
5. ✅ Genera ideas y reportes

¡Bienvenido! 🚀
