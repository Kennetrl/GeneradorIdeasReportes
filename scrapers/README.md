# Scrapers - Orquestador de Datos 🕷️

Sistema modular para recolectar problemas y dolor points de **6 fuentes diferentes**. Soporta scrapers independientes que normalizan datos a un formato unificado.

## 📋 Características

- **6 Fuentes**: Reddit, Reseñas, AlternativeTo, Hacker News, Product Hunt, App Stores
- **Modular**: Cada scraper es independiente y reutilizable
- **Normalización**: Todos los datos mapean al esquema `insights`
- **Sin Autenticación**: Usa APIs públicas o Playwright
- **Exportación**: JSON + CSV
- **Deduplicación**: Hash-based content deduplication
- **CLI Flexible**: `--only`, `--skip` para control granular

## 🚀 Inicio Rápido

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d scrapers

# O ejecuta desde el contenedor
docker-compose run scrapers python main.py
```

### Manual

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Descargar browsers para Playwright
python -m playwright install

# 4. Configurar .env (solo para autenticación si la necesitas)
# Se usan APIs públicas, así que es opcional

# 5. Ejecutar
python main.py

# Outputs en: scrapers/data/
```

## 📁 Estructura

```
scrapers/
├── main.py                       # Orquestador principal (CLI)
├── config.py                     # Configuración de todos los scrapers
├── base_scraper.py              # Clase base para todos los scrapers
├── requirements.txt              # Dependencias Python
│
├── reddit_scraper.py            # Reddit (API pública)
├── review_scraper.py            # Reseñas (Capterra/G2/Trustpilot)
├── alternativeto_scraper.py     # AlternativeTo
├── hackernews_scraper.py        # Hacker News (Algolia API)
├── producthunt_scraper.py       # Product Hunt
├── appstore_scraper.py          # App Store + Google Play
│
└── data/                         # Outputs
    ├── reddit_insights.json
    ├── alternativeto_cons.json
    ├── *.csv
    └── all_insights_<timestamp>.json
```

## 🕷️ Scrapers Disponibles

### 1. Reddit Scraper
Extrae posts con palabras clave de dolor de subreddits específicos.

```bash
python main.py --only reddit
```

**Subreddits**: ProductManagement, Startup, SaaS, Entrepreneurship, webdev
**Palabras clave**: ui, lento, difícil, caro, manual, etc.
**Output**: `reddit_insights.json`

### 2. Review Scraper
Reseñas de 1-2 estrellas de Capterra, G2, Trustpilot.

```bash
python main.py --only reviews
```

**Productos**: Notion, Trello, Asana, Monday.com
**Plataformas**: Capterra, G2, Trustpilot
**Output**: `competitor_reviews.json`

### 3. AlternativeTo Scraper
Contras/comentarios negativos sobre herramientas.

```bash
python main.py --only alt
```

**Herramientas**: Notion, Trello, Asana
**Output**: `alternativeto_cons.json`

### 4. Hacker News Scraper
Ask HN/Show HN posts relevantes a SaaS y productividad.

```bash
python main.py --only hn
```

**Fuente**: Algolia API (sin autenticación)
**Palabras clave**: idea, startup, producto, problema
**Output**: `hackernews_insights.json`

### 5. Product Hunt Scraper
Productos y comentarios de usuarios.

```bash
python main.py --only ph
```

**Tópicos**: SaaS, Productivity, Dev Tools
**Mínimo votaciones**: 50
**Output**: `producthunt_insights.json`

### 6. App Store Scraper
Reviews de App Store e iOS/Google Play.

```bash
python main.py --only apps
```

**Apps**: Notion, Trello, Asana (iOS + Android)
**Máx estrellas**: 2
**Output**: `appstore_reviews.json`

## 🎮 Uso del CLI

```bash
# Ejecutar todos
python main.py

# Ejecutar solo algunos
python main.py --only reddit hn ph

# Saltar algunos
python main.py --skip reviews apps

# Modo verbose
python main.py --verbose
```

## 📊 Formato de Output

### JSON Structure
```json
{
  "source": "reddit",
  "title": "¿Problemas con Notion?",
  "body": "Texto completo del post...",
  "url": "https://reddit.com/r/...",
  "upvotes": 234,
  "comments_count": 45,
  "source_date": "2024-03-15",
  "pain_keywords": ["lento", "ui compleja"],
  "product_name": "Notion",
  "content_hash": "abc123..."
}
```

### CSV Format
Columnas: source, title, body, url, upvotes, comments_count, source_date, pain_keywords, product_name

## ⚙️ Configuración

Editar `config.py` para cambiar:

```python
# Subreddits de Reddit
REDDIT_SUBREDDITS = ['ProductManagement', 'Startup', ...]

# URLs de reviews
REVIEW_TARGETS = {
    'notion': ['capterra_url', 'g2_url', 'trustpilot_url'],
    ...
}

# Palabras clave de dolor
PAIN_KEYWORDS = ['lento', 'caro', 'ui', 'difícil', ...]

# Límites Playwright
BROWSER_CONFIG = {
    'headless': True,
    'timeout': 30000,  # 30 segundos
    'slow_mo': 500,    # 500ms entre acciones
}
```

## 🛠️ Stack Tecnológico

| Herramienta | Uso |
|------------|-----|
| **requests** | HTTP requests a APIs públicas |
| **BeautifulSoup4** | Parsing HTML |
| **Playwright** | Scraping de sitios dinámicos |
| **Pandas** | CSV export |
| **google-play-scraper** | App Store scraping |

## 🔌 APIs Públicas Usadas

- **Reddit API**: Acceso público a posts
- **Algolia API**: Hacker News search
- **Playwright**: Automation para JS-heavy sites
- **google-play-scraper**: No necesita autenticación

## 📈 Flujo de Datos

```
Scraper Ejecuta → Normaliza → Valida → Deduplication
    ↓
Guarda JSON + CSV
    ↓
Merges all_insights_<timestamp>.json
    ↓
Backend Ingesta → Supabase Database
    ↓
Embeddings + Búsqueda Semántica
```

## 🔄 Normalización

Cada scraper mapea a esquema unificado:

```python
normalized = {
    'source': 'reddit',  # o review, alt, hn, ph, appstore
    'content_type': 'pain_point',
    'title': '...',
    'body': '...',
    'url': '...',
    'source_date': '2024-03-15',
    'upvotes': 0,
    'rating': None,
    'product_name': 'Notion',
    'pain_keywords': ['lento', 'difícil'],
    'metadata': {...}  # Datos específicos por fuente
}
```

## 🔐 Deduplicación

Usa `content_hash` (SHA256) para evitar duplicados:

```python
import hashlib
content_hash = hashlib.sha256(
    (source + title + body).encode()
).hexdigest()
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t scrapers:latest .

# Ejecutar manual
docker run --env-file .env -v $(pwd)/data:/app/data scraper python main.py

# Con docker-compose
docker-compose up scrapers

# Ver logs
docker-compose logs -f scrapers
```

## 🚨 Troubleshooting

**Error: "Playwright browsers not found"**
```bash
python -m playwright install
```

**Error: "Connection timeout"**
- Timeout predeterminado: 30 segundos
- Aumentar en config.py: `BROWSER_CONFIG['timeout'] = 60000`

**Error: "429 Too Many Requests"**
- Algunos scrapers añaden delays (slow_mo)
- Aumentar tiempos en config.py

**Scraper no encuentra elementos**
- Ejecuta con logs: `python main.py --verbose`
- Verifica que los selectores CSS en código coincidan

## ✅ Checklist de Ejecución

- [ ] Dependencias instaladas: `pip install -r requirements.txt`
- [ ] Playwright browsers: `python -m playwright install`
- [ ] .env configurado (si es necesario)
- [ ] Directorio `data/` existe y tiene permisos de escritura
- [ ] Conexión a internet (para APIs públicas)
- [ ] ~ 10-15 minutos para completar todos los scrapers

## 📊 Estadísticas Esperadas

**Por cada ejecución:**
- Reddit: ~500-1000 posts
- Reseñas: ~200-400 reviews
- AlternativeTo: ~50-100 comentarios
- Hacker News: ~100-200 threads
- Product Hunt: ~100-300 productos
- App Stores: ~200-500 reviews

**Total esperado**: 1500-2500 insights por ejecución

## 🔗 Base de Datos

Después de scrapar, importa a Supabase:

```bash
# Backend hace esto automáticamente via API
POST /api/v1/scraper/run

# O manual con psql
psql -U postgres -h db.host -d database < schema.sql
```

## 📚 Referencias

- [Reddit API](https://www.reddit.com/dev/api)
- [Playwright Docs](https://playwright.dev)
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup)
- [Algolia Search](https://www.algolia.com)
- [google-play-scraper](https://github.com/JoMingyu/google-play-scraper)

## 🤝 Agregar Nuevo Scraper

1. Heredar de `BaseScraper`:
```python
from base_scraper import BaseScraper

class NewScraper(BaseScraper):
    def __init__(self):
        super().__init__('new_source')

    def scrape(self):
        # Tu lógica aquí
        insights = []
        # ...
        self.save(insights)
```

2. Registrar en `main.py`
3. Agregar configuración en `config.py`
4. Añadir a CLI help
