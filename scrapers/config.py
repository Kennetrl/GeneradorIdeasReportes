"""
Configuración central de los scrapers.
Edita este archivo para ajustar subreddits, keywords, competidores, etc.
"""

# ─── REDDIT ──────────────────────────────────────────────────────────────────
# No requiere credenciales — usa la API JSON pública de Reddit

# Subreddits a analizar (modifica según el nicho)
REDDIT_SUBREDDITS = [
    "SaaS",
    "Entrepreneur",
    "ecommerce",
    "smallbusiness",
    "startups",
    "marketing",
]

# Palabras clave de dolor que indican un problema real
REDDIT_PAIN_KEYWORDS = [
    "struggle",
    "hate",
    "frustrating",
    "frustrated",
    "annoying",
    "is there a tool",
    "how do you",
    "wish there was",
    "can't find",
    "does anyone know",
    "looking for a way",
    "nightmare",
    "broken",
    "terrible",
    "waste of time",
    "overpriced",
    "too expensive",
]

# Rango de tiempo para filtrar posts: "day","week","month","year","all"
REDDIT_TIME_FILTER = "year"

# Máximo de posts a recuperar por subreddit
REDDIT_POST_LIMIT = 100

# ─── RESEÑAS (Capterra / G2 / Trustpilot) ───────────────────────────────────
# Lista de competidores a analizar.
# Formato: {"platform": "capterra|g2|trustpilot", "url": "<url de reviews>", "name": "<nombre producto>"}
REVIEW_TARGETS = [
    # Ejemplos — reemplaza con los competidores reales de tu nicho
    {
        "platform": "g2",
        "url": "https://www.g2.com/products/notion/reviews",
        "name": "Notion",
    },
    {
        "platform": "capterra",
        "url": "https://www.capterra.com/p/186596/Notion/reviews/",
        "name": "Notion",
    },
    {
        "platform": "trustpilot",
        "url": "https://www.trustpilot.com/review/notion.so",
        "name": "Notion",
    },
]

# Solo reseñas con esta calificación o menor (1-2 estrellas = puntos de dolor)
REVIEW_MAX_STARS = 2

# Máximo de páginas de reseñas a recorrer por competidor
REVIEW_MAX_PAGES = 5

# ─── ALTERNATIVETO ───────────────────────────────────────────────────────────
# Herramientas dominantes del nicho a analizar en AlternativeTo
ALTERNATIVETO_TARGETS = [
    # Formato: {"name": "<nombre>", "slug": "<slug en alternativeto.net>"}
    {"name": "Notion", "slug": "notion"},
    {"name": "Trello", "slug": "trello"},
]

# ─── HACKER NEWS ─────────────────────────────────────────────────────────────
# Palabras clave para buscar en HN (pueden diferir de las de Reddit)
HN_PAIN_KEYWORDS = [
    "is there a tool",
    "looking for a solution",
    "does anyone know",
    "struggle with",
    "frustrated with",
    "hate about",
    "wish there was",
    "alternative to",
    "replace",
    "too expensive",
    "doesn't scale",
    "missing feature",
]

# Tipos de posts a buscar: "story","ask_hn","show_hn","comment"
HN_TAGS = ["ask_hn", "show_hn", "story"]

# Filtros de calidad mínimos
HN_MIN_POINTS = 10       # upvotes mínimos
HN_MIN_COMMENTS = 5      # comentarios mínimos

# Páginas de resultados por keyword (50 hits/página)
HN_MAX_PAGES = 2

# ─── PRODUCT HUNT ────────────────────────────────────────────────────────────
# Topics/categorías a explorar (slug de la URL en producthunt.com/topics/<slug>)
PH_TOPICS = [
    "saas",
    "productivity",
    "developer-tools",
    "marketing",
    "e-commerce",
    "artificial-intelligence",
]

# Votos mínimos para considerar un producto relevante
PH_MIN_VOTES = 50

# Máximo de productos a analizar por topic
PH_MAX_PRODUCTS = 20

# Si True, también extrae los comentarios de cada producto (más lento)
PH_SCRAPE_COMMENTS = True

# ─── APP STORE + GOOGLE PLAY ─────────────────────────────────────────────────
# Formato por target:
#   name           → nombre del app/producto
#   google_play_id → package ID de Google Play (ej. "com.notion.id")
#   ios_app_id     → ID numérico de App Store  (ej. "1232780281")
#                    Si se deja vacío, se busca automáticamente por nombre
#   country        → país para App Store RSS (default "us")
APPSTORE_TARGETS = [
    {
        "name": "Notion",
        "google_play_id": "notion.id",
        "ios_app_id": "1232780281",
        "country": "us",
    },
    {
        "name": "Trello",
        "google_play_id": "com.trello",
        "ios_app_id": "461504587",
        "country": "us",
    },
]

# Solo reseñas con esta calificación o menor
APPSTORE_REVIEW_MAX_STARS = 2

# Máximo de reseñas a extraer por app por plataforma
APPSTORE_MAX_REVIEWS = 200

# ─── PLAYWRIGHT ──────────────────────────────────────────────────────────────
PLAYWRIGHT_HEADLESS = True       # False para depuración visual
PLAYWRIGHT_SLOW_MO = 500         # ms entre acciones (evita bloqueos)
PLAYWRIGHT_TIMEOUT = 30_000      # ms de espera por elemento

# ─── SALIDA ───────────────────────────────────────────────────────────────────
OUTPUT_DIR = "data"              # carpeta donde se guardan los resultados
