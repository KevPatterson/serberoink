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