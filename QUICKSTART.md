# 🚀 Quick Start Guide

Levanta el proyecto completo en minutos.

## ⚡ 5 Minutos - Con Docker (Recomendado)

### 1. Clona el proyecto
```bash
git clone <repo_url>
cd GeneradorIDeasReportes
```

### 2. Configura variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
- `SUPABASE_URL` - https://app.supabase.com
- `SUPABASE_SERVICE_ROLE_KEY` - Settings → API
- `SUPABASE_ANON_KEY` - Settings → API
- `GROQ_API_KEY` - https://console.groq.com/keys

### 3. Levanta todo
```bash
docker-compose up -d
```

### 4. Espera ~30 segundos y abre
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📋 Verificación

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Ver contenedores
docker ps

# Probar API
curl http://localhost:8000/health
```

## 🛑 Detener Todo

```bash
docker-compose down
```

## 📦 20 Minutos - Instalación Manual

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
# → http://localhost:3000
```

### Scrapers

```bash
cd scrapers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m playwright install
python main.py  # Ejecuta todos los scrapers
# Archivos en: scrapers/data/
```

## 🐳 Docker Comandos Útiles

```bash
# Construir imágenes sin cache
docker-compose build --no-cache

# Reconstruir solo backend
docker-compose build backend

# Ver logs en tiempo real
docker-compose logs -f

# Ejecutar command en contenedor
docker-compose exec backend python -c "print('test')"

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

## 🔌 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/insights` | Lista problems |
| POST | `/api/v1/search` | Búsqueda semántica |
| POST | `/api/v1/llm/ideas` | Generar ideas |
| POST | `/api/v1/llm/report` | Generar reportes |
| POST | `/api/v1/scraper/run` | Ejecutar scrapers |

## 📱 Páginas Disponibles

- `/` - Dashboard
- `/explorer` - Explorador
- `/ideas` - Generador de ideas
- `/reports` - Reportes
- `/scraper` - Panel de control

## 🚨 Troubleshooting

**Backend no inicia (port 8000 en uso)**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**Frontend no se conecta al backend**
```bash
# Verifica .env.local
cat frontend/.env.local

# Debería mostrar:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**SUPABASE_URL sin definir**
```bash
# Verifica .env en raíz
cat .env

# Debería tener SUPABASE_* variables
```

**Playwright browsers no instalados**
```bash
cd scrapers
python -m playwright install
```

## 📚 Documentación Completa

- [README General](/README.md) - Visión general
- [Backend README](/backend/README.md) - API y servicios
- [Frontend README](/frontend/README.md) - UI y componentes
- [Scrapers README](/scrapers/README.md) - Recolección de datos
- [GIT_SETUP.md](/GIT_SETUP.md) - Resolver issue del frontend

## 💡 Tips

1. **Desarrollo**: Usa Docker para consistencia entre devs
2. **Testing**: Accede a `/docs` para probar endpoints
3. **Base de datos**: Habilita pgvector en Supabase → Extensions
4. **Scrapers**: Ejecuta con `--only reddit` para ir rápido

## 🔐 Checklist de Seguridad

- ✅ `.env` en `.gitignore` (NUNCA subas a GitHub)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` solo en backend
- ✅ `GROQ_API_KEY` en variables de entorno
- ✅ CORS configurado en producción (no `*`)

## ⏱️ Tiempos Esperados

| Acción | Tiempo |
|--------|--------|
| Clone + setup | 2 min |
| docker-compose up | 30 sec |
| Backend ready | 10 sec |
| Frontend build | 20 sec |
| Frontend ready | 30 sec |
| Todos los scrapers | 10-15 min |

## 🎯 Próximos Pasos

1. ✅ Levanta el proyecto (`docker-compose up`)
2. ✅ Abre http://localhost:3000
3. ✅ Crea cuenta en https://supabase.com
4. ✅ Obtén GROQ key de https://console.groq.com
5. ✅ Ejecuta scrapers: `docker-compose run scrapers python main.py`
6. ✅ Explora en /explorer

¡Listo! 🚀
