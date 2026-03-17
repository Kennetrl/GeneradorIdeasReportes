# 🔐 Authentication Setup Guide

Este documento describe cómo configurar el sistema de autenticación completo con Supabase Auth, JWT verification en el backend, y OAuth providers (Google, GitHub, Facebook).

## 📋 Tabla de Contenidos

1. [Instalación de Dependencias](#instalación-de-dependencias)
2. [Configuración en Supabase Dashboard](#configuración-en-supabase-dashboard)
3. [Configuración en Google Console](#configuración-en-google-console)
4. [Configuración en GitHub](#configuración-en-github)
5. [Configuración en Meta Developers](#configuración-en-meta-developers)
6. [Variables de Entorno](#variables-de-entorno)
7. [Testing](#testing)

---

## 🔧 Instalación de Dependencias

### Backend (FastAPI)
```bash
cd backend
pip install python-jose[cryptography] httpx
```

Las dependencias ya están agregadas a `requirements.txt`:
```
python-jose[cryptography]>=3.3.0
httpx>=0.28.0
```

### Frontend (Next.js)
```bash
cd frontend
npm install @supabase/supabase-js @supabase/ssr
```

---

## ⚙️ Configuración en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com) y selecciona tu proyecto
2. En la barra lateral, ve a **Authentication** → **Providers**
3. Asegúrate de que **Email** esté habilitado (ya debe estar por defecto)
4. Ve a **Authentication** → **URL Configuration**
5. Configura:
   - **Site URL**: `http://localhost:3000` (desarrollo) o tu dominio de producción
   - **Redirect URLs**: Agrega:
     ```
     http://localhost:3000/**
     https://tudominio.com/**
     ```

---

## 🔵 Configuración en Google Console

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el nombre del proyecto (arriba a la izquierda) → **New Project**
3. Nombre: "ProblemFinder" (o lo que prefieras)
4. Click **Create**

### Paso 2: Habilitar Google+ API

1. En la búsqueda, busca **"Google+ API"**
2. Click en el resultado y luego **Enable**
3. Espera a que se habilite (unos 30 segundos)

### Paso 3: Crear OAuth Credentials

1. Ve a **Credentials** (en la barra lateral izquierda)
2. Click **Create Credentials** → **OAuth client ID**
3. Si te pide configurar consentimiento:
   - Click **Configure Consent Screen**
   - Selecciona **External**
   - Click **Create**
   - Llena los campos:
     - **App name**: ProblemFinder
     - **User support email**: tu-email@gmail.com
     - Click **Save and Continue**
   - En **Scopes**: Click **Save and Continue** (sin agregar scopes extra)
   - En **Test users**: Click **Save and Continue**
   - Click **Back to Dashboard**

4. De nuevo en **Credentials**, click **Create Credentials** → **OAuth client ID**
5. **Application type**: "Web application"
6. **Name**: "ProblemFinder Web Client"
7. En **Authorized redirect URIs**, agrega:
   ```
   https://yumhlyuvidhvkixdiyke.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
8. Click **Create**
9. **Copia el Client ID y Client Secret** (los necesitarás en Supabase)

### Paso 4: Agregar a Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com) → **Authentication** → **Providers** → **Google**
2. Pega el **Client ID** y **Client Secret** en los campos correspondientes
3. Click **Save**

---

## 🐙 Configuración en GitHub

### Paso 1: Crear OAuth App

1. Ve a [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Llena los campos:
   - **Application name**: ProblemFinder
   - **Homepage URL**: `http://localhost:3000` (desarrollo) o tu dominio
   - **Authorization callback URL**: `https://yumhlyuvidhvkixdiyke.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Ve a la pestaña **Client secrets** y click **Generate a new client secret**
6. **Copia el Client ID y Client Secret**

### Paso 2: Agregar a Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com) → **Authentication** → **Providers** → **GitHub**
2. Pega el **Client ID** y **Client Secret**
3. Click **Save**

---

## 📱 Configuración en Meta Developers

### Paso 1: Crear App en Meta Developers

1. Ve a [Meta Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. **App Type**: "Consumer"
4. Llena los datos y click **Create App**
5. En el dashboard, ve a **Settings** → **Basic**
6. **Copia el App ID y App Secret**

### Paso 2: Configurar Facebook Login

1. En el dashboard del app, click **+ Add Product**
2. Busca **Facebook Login** y click **Set Up**
3. Selecciona **Web**
4. En **Facebook Login** → **Settings**, agrega en **Valid OAuth Redirect URIs**:
   ```
   https://yumhlyuvidhvkixdiyke.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
5. Click **Save Changes**

### Paso 3: Agregar a Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com) → **Authentication** → **Providers** → **Facebook**
2. Pega el **App ID** y **App Secret**
3. Click **Save**

---

## 🌍 Variables de Entorno

### Backend (`.env`)
```env
SUPABASE_URL=https://yumhlyuvidhvkixdiyke.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
GROQ_API_KEY=gsk_your_groq_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://yumhlyuvidhvkixdiyke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Testing

### 1. Iniciar el Servidor

```bash
# Backend (en una terminal)
cd backend
python -m uvicorn main:app --reload

# Frontend (en otra terminal)
cd frontend
npm run dev
```

### 2. Probar Flujo de Autenticación

1. Abre [http://localhost:3000/login](http://localhost:3000/login)
2. **Prueba email/contraseña**:
   - Click **Sign Up**
   - Usa: `test@example.com` / `password123`
   - Deberías recibir un email de confirmación
   - Click en el link del email
   - Deberías estar en el dashboard

3. **Prueba Google OAuth**:
   - Click **Google**
   - Selecciona tu cuenta de Google
   - Deberías ser redirigido al dashboard

4. **Prueba GitHub OAuth**:
   - Click **GitHub**
   - Autoriza la app
   - Deberías ser redirigido al dashboard

### 3. Verificar Roles

1. Login con un usuario
2. Abre `http://localhost:8000/docs` (Swagger UI del backend)
3. Try it out en `/admin/users`:
   - El header `Authorization` debe incluir `Bearer {token}`
   - Si el usuario es `admin`, deberías ver la lista de usuarios
   - Si no, deberías recibir un error 403

### 4. Cambiar Roles

1. Login como admin
2. Ve a [http://localhost:3000/admin/users](http://localhost:3000/admin/users)
3. Deberías ver una tabla con todos los usuarios
4. Cambia el rol de un usuario (excepto el tuyo)
5. Guarda y verifica que el cambio se reflejó

---

## 🔒 Flujo de Seguridad

```
Frontend (Next.js)
│
├─ /login → Supabase Auth UI (email o OAuth)
│          ↓
│          JWT token guardado en cookie
│          ↓
│          Redirige a /
│
├─ middleware.ts
│  ├─ Verifica si hay sesión en cookie
│  ├─ Si no hay sesión → redirige a /login
│  └─ Si hay sesión → continúa
│
└─ Llamadas a API
   │
   ├─ Envía: Authorization: Bearer {JWT}
   │
   └─ Backend (FastAPI)
      │
      ├─ JWT_verification.py
      │  ├─ Verifica firma con clave pública de Supabase
      │  ├─ Extrae user_id del token
      │  └─ Busca rol en user_profiles
      │
      ├─ Si válido → continúa (o chequea rol)
      └─ Si inválido → retorna 401/403
```

---

## 🐛 Troubleshooting

### Error: "Invalid redirect URI"
- Verifica que el redirect URI en Google/GitHub/Meta coincida exactamente con el de Supabase
- Recuerda que `http://localhost` y `http://127.0.0.1` son diferentes

### Error: "JWT verification failed"
- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` sean correctos
- Asegúrate de que el token no esté expirado (expira en 1 hora por defecto)

### Error: "User profile not found"
- Verifica que la migración SQL de `user_profiles` se haya ejecutado
- Verifica que el trigger de `handle_new_user` esté creado

### OAuth providers no funcionan
- Verifica que los `Client ID` y `Secret` sean correctos
- Verifica que los redirect URIs sean exactos (incluye `https://`, no `http://`)

---

## 📚 Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [NextAuth.js Alternative](https://next-auth.js.org/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

## ✅ Checklist de Configuración

- [ ] Tabla `user_profiles` creada en Supabase
- [ ] Trigger `handle_new_user` configurado
- [ ] RLS policies en `user_profiles`
- [ ] Backend: `python-jose` instalado
- [ ] Frontend: `@supabase/supabase-js` instalado
- [ ] Variables de entorno configuradas
- [ ] Google OAuth configurado
- [ ] GitHub OAuth configurado
- [ ] Facebook OAuth configurado
- [ ] Supabase URL Configuration configurada
- [ ] Flujo de login testeado
- [ ] Flujo de roles testeado
