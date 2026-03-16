# 🔧 Git Setup - Eliminar .git Anidado del Frontend

## 🚨 Problema

El directorio `frontend/` contiene su propio repositorio git (`.git`) anidado, lo que **impide subir el proyecto a GitHub**.

## ✅ Solución (Una sola opción)

Solo mantén el `.git` general del proyecto raíz. El frontend será un directorio normal dentro del repositorio principal.

### Pasos

```bash
# 1. Ir a la raíz del proyecto
cd "D:\Escritorio\Kennet\ProyectosGit\GeneradorIDeasReportes"

# 2. Eliminar el .git del frontend
rmdir /s /q frontend\.git

# 3. Verificar que no hay más .git anidados
where /r . .git

# 4. Agregar frontend al repositorio principal
git add frontend/

# 5. Commit
git commit -m "Integrate frontend into main repository"

# 6. Push
git push origin main
```

### ✅ Verificación

Después de ejecutar, ejecuta:

```bash
# Debería mostrar SOLO un .git en la raíz
where /r . .git

# Status debería estar limpio
git status

# El frontend debería estar tracked
git ls-tree -r HEAD | grep "frontend/" | head -5
```

## 🎯 Resultado

- ✅ Un único repositorio git
- ✅ Frontend como directorio normal
- ✅ Todo se puede subir a GitHub
- ✅ Docker funciona sin cambios
- ✅ Flujo de trabajo simple

## 📊 Estructura Final

```
GeneradorIDeasReportes/         (repo principal)
├── .git/                       (ÚNICO repositorio)
├── backend/
├── frontend/                   (directorio normal, sin .git)
├── scrapers/
└── ...
```

## 🆘 Si Algo Sale Mal

```bash
# Deshacer último commit (si lo hiciste)
git reset --soft HEAD~1

# Restaurar desde backup
git reflog
git reset --hard <commit_hash>
```
