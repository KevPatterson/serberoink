# Serbero Ink

Aplicacion web construida con Next.js 15, React 19, TypeScript y Tailwind CSS.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

La app levanta en `http://localhost:4028`.

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo en el puerto 4028
- `npm run build`: genera el build de produccion
- `npm run serve`: ejecuta el servidor de produccion (`next start`)
- `npm run start`: inicia Next.js en modo desarrollo (equivalente actual en este repo)
- `npm run lint`: ejecuta linting con Next.js ESLint
- `npm run lint:fix`: corrige errores de lint automaticamente
- `npm run type-check`: valida tipos TypeScript sin emitir archivos
- `npm run format`: formatea codigo fuente con Prettier

## Estructura principal

```txt
src/
  app/
    homepage/
      page.tsx
      components/
    admin/
      page.tsx
    layout.tsx
    not-found.tsx
    robots.ts
    sitemap.ts
  components/
    ui/
  lib/
  styles/
public/
  assets/
    images/
```

## Deploy

Para produccion:

```bash
npm run build
npm run serve
```

Este repo incluye:

- `.gitignore` actualizado para entorno local
- `.vercelignore` para reducir archivos enviados en despliegues

## CMS sin base de datos (GitHub-backed)

El panel `/admin` guarda los cambios directamente en el repositorio usando GitHub REST API.

### Variables requeridas (`.env.local` y Vercel)

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=nombre_del_owner
GITHUB_REPO=nombre_del_repo
GITHUB_BRANCH=main
ADMIN_PASSWORD=una_contrasena_segura
```

Notas:

- `GITHUB_TOKEN` debe tener permisos `contents:write`.
- El token nunca se expone al cliente: solo se usa en API routes.
- El contenido se guarda en `public/content/content.json`.

### Flujo de lectura/escritura

- Lectura: la homepage obtiene contenido en runtime desde `raw.githubusercontent.com` (`cache: no-store`).
- Escritura: `/admin` llama a `/api/cms/update` y `/api/cms/upload-image`, y esas rutas actualizan archivos en el repo.

### Endpoints CMS

- `POST /api/cms/auth` autentica admin y setea cookie httpOnly.
- `GET /api/cms/content` devuelve el estado actual de `content.json`.
- `POST /api/cms/update` actualiza JSON o archivos en una ruta del repo.
- `POST /api/cms/upload-image` sube imágenes a `public/content/images/` y devuelve URL raw.