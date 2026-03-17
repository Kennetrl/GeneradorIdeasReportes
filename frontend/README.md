# Frontend - Next.js 14 🎨

Interfaz moderna para explorar problemas, generar ideas y analizar reportes competitivos. Construida con **Next.js 14**, **React 18**, **TypeScript** y **Tailwind CSS**.

## 📋 Características

- **Dashboard Interactivo**: Estadísticas en tiempo real
- **Explorador Avanzado**: Filtros, búsqueda semántica
- **Modo Oscuro**: next-themes integrado
- **Componentes Reutilizables**: shadcn/ui
- **Responsive**: Mobile-first con Tailwind CSS
- **Tipado Completo**: TypeScript en todo el proyecto

## 🚀 Inicio Rápido

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d frontend

# Frontend estará en: http://localhost:3000
```

### Manual

```bash
# 1. Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# 2. Configurar variable de entorno
# Crear .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 3. Ejecutar en desarrollo
npm run dev

# Frontend: http://localhost:3000
```

## 📁 Estructura

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 13+)
│   │   ├── page.tsx             # Home/Dashboard
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Estilos globales
│   │   ├── explorer/            # Explorador de insights
│   │   ├── ideas/               # Generador de ideas
│   │   ├── insights/[id]/       # Detalle de insight
│   │   ├── reports/             # Reportes competitivos
│   │   ├── scraper/             # Panel de scrapers
│   │   ├── not-found.tsx        # 404
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── fonts/               # Tipografías (Geist)
│   ├── components/
│   │   ├── dashboard/           # Home page components
│   │   ├── explorer/            # Explorer page components
│   │   ├── ideas/               # Ideas generation form
│   │   ├── layout/              # Header, Footer, Nav, Theme toggle
│   │   ├── shared/              # Componentes reutilizables
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── api.ts               # Cliente API
│       ├── api-types.ts         # TypeScript interfaces
│       ├── constants.ts
│       └── utils.ts
├── public/                       # Archivos estáticos
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── .env.local                    # Variables locales (gitignored)
```

## 📖 Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con stats y búsqueda rápida |
| `/explorer` | Explorador avanzado con filtros |
| `/insights/[id]` | Detalle completo de un insight |
| `/ideas` | Formulario para generar ideas |
| `/reports` | Generador de reportes competitivos |
| `/scraper` | Panel de control de scrapers |

## 🔌 API Integration

### Cliente API (`lib/api.ts`)

```typescript
import { getInsights, searchInsights, generateIdeas } from '@/lib/api';

// Obtener insights
const insights = await getInsights({
  limit: 20,
  offset: 0,
  source: 'reddit'
});

// Búsqueda semántica
const results = await searchInsights('problemas de gestión');

// Generar ideas
const ideas = await generateIdeas({
  pain_points: ['UI compleja', 'lenta'],
  market: 'SaaS'
});
```

### Variables de Entorno

```env
# .env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🛠️ Stack Tecnológico

| Librería | Propósito |
|----------|-----------|
| **Next.js 14** | Framework React con SSR |
| **React 18** | UI library |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Styling utility-first |
| **shadcn/ui** | Componentes UI reutilizables |
| **next-themes** | Dark mode |
| **recharts** | Gráficos |
| **react-markdown** | Renderizado de markdown |
| **lucide-react** | Iconografía |

## 🎨 Diseño

### Componentes shadcn/ui

- Button, Input, Card, Badge
- Select, Checkbox, RadioGroup
- Dialog, AlertDialog
- Tabs, Accordion
- Pagination, Skeleton
- Toast notifications

### Tailwind CSS

```typescript
// Dark mode automático
<div className="dark:bg-slate-950 dark:text-white">
```

### Markdown

```typescript
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<Markdown remarkPlugins={[remarkGfm]}>
  {content}
</Markdown>
```

## 🚀 Build & Deploy

```bash
# Build para producción
npm run build

# Ejecutar build localmente
npm run start

# Análisis de bundle
npm run analyze

# Lint
npm run lint

# Formato
npm run format
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t frontend:latest .

# Ejecutar contenedor
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8000/api/v1 frontend:latest

# Con docker-compose
docker-compose up frontend
```

## 📱 Responsive Design

Diseño mobile-first:
```typescript
// Tailwind breakpoints
<div className="
  grid
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4
">
```

## 🔍 SEO

- Metadata en `layout.tsx`
- sitemap.ts automático
- robots.ts configurado
- Open Graph metas

## ⚡ Performance

- Image optimization (next/image)
- Code splitting automático
- Static generation donde sea posible
- Font optimization (Geist)

## 🧪 Testing

```bash
# Tests con Jest
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔐 Seguridad

- ✅ CSP headers en next.config.mjs
- ✅ HTTPS en producción
- ✅ Validación de inputs
- ✅ Sanitización de markdown
- ✅ API keys en .env (nunca expuestas)

## 🚨 Troubleshooting

**Error: "NEXT_PUBLIC_API_URL is undefined"**
```bash
# Asegúrate de que .env.local existe
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

**Error: "Cannot find module"**
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 en uso**
```bash
# Especifica otro puerto
npm run dev -- -p 3001
```

## 📚 Componentes Custom

### DashboardStats
```typescript
<DashboardStats insights={data} />
```

### ExplorerFilter
```typescript
<ExplorerFilter onFilter={handleFilter} />
```

### InsightCard
```typescript
<InsightCard insight={insight} />
```

### MarkdownRenderer
```typescript
<MarkdownRenderer content={markdown} />
```

## 🔗 Enlaces Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

## 📦 Dependencias Principales

```json
{
  "next": "14.2.35",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "@tailwindcss/typography": "^0.5.19",
  "shadcn": "^4.0.8",
  "recharts": "^3.8.0",
  "next-themes": "^0.4.6",
  "react-markdown": "^10.1.0",
  "lucide-react": "^0.577.0"
}
```

## 🤝 Contribuir

1. Crea una rama (`git checkout -b feature/mejora`)
2. Commit cambios (`git commit -m 'Agrega feature'`)
3. Push (`git push origin feature/mejora`)
4. PR con descripción clara
