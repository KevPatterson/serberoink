# Serbero Ink

Sitio web de estudio de tatuajes construido con Next.js 15 + React 19 + TypeScript, con panel CMS propio en `/admin`.

El proyecto esta disenado para funcionar sin base de datos: el contenido se guarda versionado en el mismo repositorio (archivo JSON + imagenes), y la pagina publica consume esos cambios casi en tiempo real.

## Caracteristicas clave

- Sitio publico visual en `/homepage` con contenido editable.
- CMS admin protegido por password y cookie `httpOnly`.
- Persistencia GitHub-backed (sin Postgres, MySQL, Mongo, etc.).
- Traduccion automatica ES -> EN al guardar desde el panel.
- Fallback de traducciones para que la web no se quede sin textos si falla el proveedor.
- Refresco de contenido en homepage mediante polling de version cada 5 segundos.

## Stack tecnico

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Sonner (toasts del admin)
- GitHub REST API (persistencia de archivos)
- Azure Translator o Gemini (traduccion automatica)

## Requisitos

- Node.js 20+
- npm 10+

## Inicio rapido

1. Instalar dependencias.

```bash
npm install
```

2. Crear `/.env.local` con las variables de entorno (seccion siguiente).

3. Iniciar en desarrollo.

```bash
npm run dev
```

4. Abrir:

- Homepage: `http://localhost:4028/homepage`
- Admin: `http://localhost:4028/admin`

## Variables de entorno

Configura estas variables en `/.env.local` y en tu entorno de despliegue (por ejemplo Vercel).

### Requeridas para CMS GitHub-backed

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=tu_owner
GITHUB_REPO=tu_repo
GITHUB_BRANCH=main
ADMIN_PASSWORD=una_password_segura
```

Notas:

- `GITHUB_TOKEN` necesita permisos para escribir contenido del repo (`contents:write`).
- `public/content/content.json` es la fuente de contenido editable.
- Las imagenes del CMS se guardan en `public/content/images/`.

### Requeridas para traduccion automatica (elige una o ambas)

Opcion Azure Translator:

```bash
AZURE_TRANSLATOR_KEY=...
AZURE_TRANSLATOR_REGION=...
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
```

Opcion Gemini:

```bash
GEMINI_API_KEY=...
```

Preferencia de proveedor:

```bash
TRANSLATION_PROVIDER=auto
```

Valores permitidos: `auto`, `azure`, `gemini`.

### Opcionales

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
VERCEL_TOKEN=...
VERCEL_PROJECT_ID=...
```

Uso de opcionales:

- `NEXT_PUBLIC_SITE_URL`: canonical, Open Graph, sitemap y robots.
- `UPSTASH_*`: rate limiting distribuido; sin estas variables se usa rate limit en memoria.
- `VERCEL_*`: necesario para la accion de cambio de password desde el panel admin.

## Scripts

- `npm run dev`: Next.js en modo desarrollo, puerto 4028.
- `npm run build`: build de produccion.
- `npm run serve`: ejecutar produccion (`next start`).
- `npm run start`: actualmente igual que `dev` en este repo.
- `npm run lint`: lint con Next.js ESLint.
- `npm run lint:fix`: autocorreccion de lint.
- `npm run type-check`: `tsc --noEmit`.
- `npm run format`: Prettier en `src/**/*.{ts,tsx,css,md,json}`.

## Arquitectura general

### Estructura principal

```txt
src/
  app/
    homepage/
      page.tsx
      components/
    admin/
      login/page.tsx
      page.tsx
    api/cms/
      auth/route.ts
      content/route.ts
      update/route.ts
      upload-image/route.ts
      version/route.ts
      logout/route.ts
      change-password/route.ts
  lib/
    content.ts
    cms-auth.ts
    cms-github.ts
    cms-rate-limit.ts
    translate.ts
  hooks/
    useContentPolling.ts
public/
  content/
    content.json
    images/
```

### Flujo de datos (alto nivel)

1. Homepage carga contenido inicial desde `getContent()`.
2. `getContent()` intenta leer `public/content/content.json` desde `raw.githubusercontent.com` del branch configurado.
3. Si falla lectura remota, hace fallback a archivo local.
4. En `/admin`, al guardar, se suben cambios al repo via GitHub API.
5. Al guardar `content.json`, se incrementa `_meta.version` y se actualiza `_meta.lastUpdated`.
6. La homepage consulta `/api/cms/version` cada 5s; si detecta version mayor, trae nuevo contenido desde `/api/cms/content`.

Resultado: actualizacion casi inmediata sin base de datos ni websocket.

## CMS admin en detalle

### 1) Seguridad de acceso

- La ruta `/admin/:path*` esta protegida por `middleware.ts`.
- `/admin/login` queda publica para autenticar.
- Login (`POST /api/cms/auth`) compara password contra `ADMIN_PASSWORD`.
- Si es valida, crea cookie `admin_authenticated` `httpOnly`, `sameSite=strict` y `secure` en produccion.
- Logout (`POST /api/cms/logout`) invalida cookie.

Tambien hay validacion de cookie en endpoints mutables (`/api/cms/update`, `/api/cms/upload-image`, `/api/cms/change-password`).

### 2) Secciones editables del panel

El panel permite editar:

- Portfolio
- Hero
- About
- Specialties
- Contact
- Footer

Cada seccion detecta cambios pendientes comparando estado actual vs ultimo estado guardado.

### 3) Guardado del contenido

Al guardar desde el panel:

1. Se prepara `nextContent`.
2. Se actualiza metadata:
   - `_meta.lastUpdated = new Date().toISOString()`
   - `_meta.version = _meta.version + 1`
3. Se llama `POST /api/cms/update` con `path = public/content/content.json`.
4. El backend traduce y persiste en GitHub con commit message CMS.

Para imagenes:

- Se usa `POST /api/cms/upload-image`.
- Solo admite `image/jpeg`, `image/png`, `image/webp`.
- Se guarda en `public/content/images/` y devuelve URL raw de GitHub.

### 4) Endpoints CMS

- `POST /api/cms/auth`: login y cookie admin.
- `POST /api/cms/logout`: cerrar sesion.
- `GET /api/cms/content`: devuelve `SiteContent` actual.
- `GET /api/cms/version`: devuelve `{ version, lastUpdated }`.
- `POST /api/cms/update`: persiste JSON/archivos permitidos y ejecuta traduccion si aplica.
- `POST /api/cms/upload-image`: sube imagen a GitHub.
- `POST /api/cms/change-password`: actualiza `ADMIN_PASSWORD` en Vercel API.

### 5) Rate limit

Los endpoints sensibles aplican rate limiting:

- Por defecto: en memoria (Map en proceso).
- Si hay `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`: usa Upstash Redis REST.

## Como se actualiza la web instantaneamente sin base de datos

Este es el punto mas importante del proyecto.

### Principio

No hay DB tradicional. El estado canonico es un archivo versionado (`public/content/content.json`) y assets en `public/content/images/` dentro del repo.

### Mecanismo

1. El admin guarda cambios y eso escribe directo al repo via GitHub API.
2. El guardado incrementa `_meta.version`.
3. La homepage tiene polling (cada 5000 ms) a `/api/cms/version`.
4. Si la version remota es mayor que la local, solicita `/api/cms/content`.
5. Se actualiza estado de React y el usuario ve los nuevos datos sin recargar manualmente.

### Por que funciona sin DB

- El repo actua como almacenamiento persistente y versionado.
- `raw.githubusercontent.com` permite lectura HTTP del JSON y de imagenes.
- El frontend solo necesita versionado para detectar cambios.

### Limitaciones practicas

- Es near real-time, no real-time estricto: depende de polling + propagacion de contenido en GitHub raw.
- El rate limit en memoria no es global en ambientes serverless con multiples instancias.
- No hay transacciones complejas como en una DB relacional.

## Sistema de traducciones (ES/EN)

### Donde viven las traducciones

Dentro del mismo `content.json`, en la clave:

```json
{
  "i18n": {
    "es": { "...": "..." },
    "en": { "...": "..." }
  }
}
```

### Cuándo se traduce

Solo durante guardado CMS de `content.json` en `POST /api/cms/update`.

No se traduce en runtime de la homepage ni en cliente admin.

### Proveedores y fallback

Orden de proveedores segun `TRANSLATION_PROVIDER`:

- `auto`: Azure -> Gemini
- `azure`: Azure -> Gemini
- `gemini`: Gemini -> Azure

Si ambos fallan:

- Se guarda igual el contenido (no se bloquea el guardado).
- Se genera `i18n` de fallback para evitar UI vacia.
- El panel muestra warning de traduccion.

### Como se aplica en frontend

- El idioma se mantiene con cookie + localStorage (`serbero_lang`, legacy `serberoink-lang`).
- `LanguageContext.localizeContent()` mezcla contenido base con `content.i18n[lang]`.
- Para labels UI fijos, se usan diccionarios en `src/lib/ui-strings.ts`.

En resumen: contenido editable traducido desde CMS + etiquetas de interfaz traducidas por diccionario local.

## Modelo de contenido

`SiteContent` incluye:

- `hero`
- `about`
- `specialties`
- `portfolio` (incluye array de imagenes)
- `contact`
- `footer`
- `_meta` (versionado)
- `i18n` (variantes ES/EN)

Si faltan campos en `content.json`, `normalizeContent()` aplica defaults seguros.

## Produccion

Build y run:

```bash
npm run build
npm run serve
```

Checklist recomendado para despliegue:

1. Configurar todas las variables de entorno.
2. Validar permisos del `GITHUB_TOKEN`.
3. Validar que `NEXT_PUBLIC_SITE_URL` apunte al dominio final.
4. Probar login en `/admin` y guardado de una edicion minima.
5. Confirmar que `_meta.version` aumenta y la homepage refleja el cambio.

## SEO y metadatos

- Metadata principal en `src/app/layout.tsx`.
- `robots.txt` en `src/app/robots.ts` (bloquea `/api/`, `/_next/`, `/admin/`).
- `sitemap.xml` en `src/app/sitemap.ts`.

## Troubleshooting

Documentacion de incidentes en `docs/`:

- `docs/error-401-login-despues-cambio-contrasena.md`
- `docs/error-closures-stale-portfolio.md`

Problemas comunes:

- Error 401 en admin: revisar `ADMIN_PASSWORD`, cookies y entorno actual.
- No guarda en GitHub: revisar `GITHUB_TOKEN`, owner/repo/branch y permisos.
- Traduccion no actualiza: revisar credenciales Azure/Gemini y rate limits.
- Cambios tardan en verse: recordar polling de 5s + latencia de propagacion en raw de GitHub.