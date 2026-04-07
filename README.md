# Serbero Ink

Sitio web de estudio de tatuajes construido con Next.js 15, React 19 y TypeScript, con CMS propio en la ruta /admin.

El proyecto esta pensado para operar sin base de datos tradicional. El contenido vive en archivos versionados dentro del repo y se publica casi en tiempo real en la homepage.

## Caracteristicas

- Sitio publico en /homepage con secciones editables desde CMS.
- CMS protegido por password y cookie httpOnly.
- Sesiones admin con expiracion y firma (al vencer, recargar /admin redirige a /admin/login).
- Persistencia en GitHub (content.json + imagenes en public/content/images).
- Traduccion automatica ES/EN con fallback.
- Refresco de homepage por version polling cada 5 segundos.

## Stack tecnico

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Sonner (notificaciones del admin)
- GitHub REST API (lectura/escritura de contenido)
- Azure Translator y/o Gemini (traducciones)

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Inicio rapido

1. Instalar dependencias.

```bash
npm install
```

2. Crear archivo de entorno local.

```bash
cp .env.example .env.local
```

Si no tienes .env.example, crea .env.local manualmente con las variables de la seccion de entorno.

3. Iniciar el entorno de desarrollo.

```bash
npm run dev
```

4. Abrir en navegador:

- Homepage: http://localhost:4028/homepage
- Admin: http://localhost:4028/admin

## Variables de entorno

Configura estas variables en .env.local y en produccion.

### Requeridas para CMS

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=tu_owner
GITHUB_REPO=tu_repo
GITHUB_BRANCH=main
ADMIN_PASSWORD=una_password_segura
```

Notas:

- GITHUB_TOKEN necesita permisos para leer/escribir contenido del repo.
- El contenido principal se guarda en public/content/content.json.
- Las imagenes del CMS se guardan en public/content/images.

### Requeridas para traduccion automatica

Puedes usar uno o ambos proveedores.

Azure Translator:

```bash
AZURE_TRANSLATOR_KEY=...
AZURE_TRANSLATOR_REGION=...
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
```

Gemini:

```bash
GEMINI_API_KEY=...
```

Proveedor preferido:

```bash
TRANSLATION_PROVIDER=auto
```

Valores permitidos: auto, azure, gemini.

### Opcionales

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
VERCEL_TOKEN=...
VERCEL_PROJECT_ID=...
```

Uso:

- NEXT_PUBLIC_SITE_URL: metadata SEO, canonical, robots y sitemap.
- UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN: rate limit distribuido.
- VERCEL_TOKEN/VERCEL_PROJECT_ID: soporte para cambio de password admin via API de Vercel.

## Scripts

- npm run dev: inicia Next.js en desarrollo en el puerto 4028.
- npm run build: build de produccion.
- npm run serve: ejecuta la build con next start.
- npm run start: en este repo actualmente corre next dev -p 4028.
- npm run lint: lint con configuracion de Next.js.
- npm run lint:fix: lint con autocorreccion.
- npm run type-check: validacion TypeScript (tsc --noEmit).
- npm run format: formateo Prettier de archivos en src.

## Arquitectura

### Estructura principal

```txt
src/
  app/
    admin/
      login/page.tsx
      page.tsx
      components/
    api/cms/
      auth/route.ts
      change-password/route.ts
      content/route.ts
      logout/route.ts
      update/route.ts
      upload-image/route.ts
      version/route.ts
    homepage/
      page.tsx
      components/
  hooks/
    useContentPolling.ts
  lib/
    cms-auth.ts
    cms-github.ts
    cms-rate-limit.ts
    content.ts
    translate.ts
public/
  content/
    content.json
    images/
middleware.ts
```

### Flujo de contenido

1. getContent() intenta leer public/content/content.json desde raw.githubusercontent.com.
2. Si la lectura remota falla, usa fallback local.
3. El panel admin guarda cambios por API hacia GitHub.
4. Cada guardado incrementa _meta.version y actualiza _meta.lastUpdated.
5. La homepage consulta /api/cms/version cada 5 segundos.
6. Si hay version mas alta, pide /api/cms/content y refresca estado.

## CMS Admin

### Seguridad y sesion

- /admin/:path* esta protegido por middleware.ts.
- /admin/login permanece publica.
- POST /api/cms/auth valida ADMIN_PASSWORD y emite cookie admin_authenticated.
- La cookie incluye version, expiresAt y firma, con maxAge de 12 horas.
- Middleware y endpoints mutables validan firma y vencimiento de la cookie.
- Si la sesion expira, recargar /admin redirige a /admin/login.
- POST /api/cms/logout invalida la cookie.

### Endpoints CMS

- POST /api/cms/auth: login admin.
- POST /api/cms/logout: cierre de sesion.
- GET /api/cms/content: devuelve SiteContent normalizado.
- GET /api/cms/version: devuelve version y lastUpdated.
- POST /api/cms/update: guarda contenido/archivos permitidos y aplica traduccion.
- POST /api/cms/upload-image: sube imagen y devuelve URL publica /content/images/...
- POST /api/cms/change-password: actualiza ADMIN_PASSWORD en Vercel y cierra sesion.

### Rate limiting

- Si hay credenciales Upstash, usa Redis REST.
- Si no, fallback en memoria por proceso.

## Traducciones

### Donde se guardan

Dentro de content.json en la clave i18n (es y en).

### Cuándo se ejecutan

Solo en el guardado de content.json (POST /api/cms/update).

### Orden de proveedores

- auto: Azure -> Gemini
- azure: Azure -> Gemini
- gemini: Gemini -> Azure

Si ambos fallan, el guardado no se bloquea: se guarda contenido con fallback de i18n y warning en admin.

## Modelo de contenido

El tipo SiteContent incluye:

- hero
- about
- specialties
- portfolio
- contact
- footer
- _meta
- i18n

Si faltan campos en content.json, normalizeContent() completa valores por defecto.

## Desarrollo y calidad

Comandos recomendados antes de desplegar:

```bash
npm run type-check
npm run build
```

Nota: la configuracion de next.config.mjs actualmente permite ignoreBuildErrors e ignoreDuringBuilds. Si quieres endurecer CI/CD, considera desactivarlos

## Produccion

Build y ejecucion:

```bash
npm run build
npm run serve
```

Checklist de despliegue:

1. Configurar variables de entorno requeridas.
2. Validar permisos de GITHUB_TOKEN.
3. Verificar NEXT_PUBLIC_SITE_URL al dominio final.
4. Probar login admin, guardado y logout.
5. Confirmar que _meta.version sube y homepage refleja cambios.
6. Esperar expiracion de sesion y verificar redireccion a /admin/login al recargar.

## SEO y metadatos

- Metadata principal: src/app/layout.tsx
- robots: src/app/robots.ts
- sitemap: src/app/sitemap.ts
- schema JSON-LD: src/components/SchemaInjector.tsx

## Troubleshooting

Documentacion interna:

- docs/error-401-login-despues-cambio-contrasena.md
- docs/error-closures-stale-portfolio.md

Problemas comunes:

- 401 en admin: revisar ADMIN_PASSWORD, cookie vencida y entorno activo.
- No guarda en GitHub: revisar token, owner/repo/branch y permisos.
- Traduccion no se actualiza: revisar credenciales Azure/Gemini y limites del proveedor.
- Cambios tardan en verse: considerar polling (5s) y latencia de raw.githubusercontent.com.
