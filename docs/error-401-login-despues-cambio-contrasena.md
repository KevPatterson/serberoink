# Error 401 en login despues de cambiar contrasena (Admin CMS)

## Resumen rapido

Este incidente ocurre cuando se cambia `ADMIN_PASSWORD` desde el panel admin, pero luego el login responde `401` en `POST /api/cms/auth`.

Sintoma en navegador:

- `Failed to load resource: the server responded with a status of 401 ()` en `/api/cms/auth`

## Impacto

- El admin no puede iniciar sesion con la nueva contrasena.
- La variable en Vercel puede haber cambiado, pero el runtime que autentica puede seguir usando un valor anterior.

## Causa raiz

Hay 3 causas comunes para este caso:

1. Entorno local desalineado:
- El login en local usa `process.env.ADMIN_PASSWORD`.
- Si `.env.local` mantiene la contrasena vieja, el login devuelve 401 aunque en Vercel ya se haya actualizado.

2. Entorno de Vercel actualizado en target incorrecto:
- Vercel permite varias env vars con la misma key (`production`, `preview`, `development`).
- Si se actualiza la entrada incorrecta, el deployment actual no recibe la nueva contrasena.

3. Runtime no refrescado:
- Cambiar env vars en Vercel no siempre garantiza que el runtime ya levantado use el nuevo valor de inmediato.
- Puede requerir redeploy o que el proceso se reinicie.

## Archivos relevantes

- `src/app/api/cms/auth/route.ts`
- `src/lib/cms-auth.ts`
- `src/app/api/cms/change-password/route.ts`
- `.env.local`

## Fix aplicado en el proyecto

En `src/app/api/cms/change-password/route.ts` se aplicaron mejoras para evitar este problema:

1. Buscar todas las env vars `ADMIN_PASSWORD` y priorizar las que coinciden con `process.env.VERCEL_ENV`.
2. Si no hay match por target, actualizar todas las coincidencias de `ADMIN_PASSWORD`.
3. Sincronizar `process.env.ADMIN_PASSWORD = newPassword` en el runtime actual despues del cambio.
4. Invalidar la cookie admin para forzar nuevo login.

## Como resolverlo paso a paso

### A) Si estas probando en local

1. Abrir `.env.local`.
2. Actualizar `ADMIN_PASSWORD` al nuevo valor.
3. Reiniciar el servidor local (`npm run dev`).
4. Intentar login otra vez con la nueva contrasena.

Checklist:

- `ADMIN_PASSWORD` en `.env.local` coincide con la nueva contrasena.
- El servidor se reinicio despues del cambio.
- `POST /api/cms/auth` responde 200.

### B) Si estas probando en Vercel

1. Confirmar que existen `VERCEL_TOKEN` y `VERCEL_PROJECT_ID` en el servidor.
2. En Vercel, revisar `Settings -> Environment Variables` y verificar `ADMIN_PASSWORD` para el target correcto (`production`/`preview`/`development`).
3. Ejecutar nuevamente el cambio de contrasena desde `/admin` para aplicar el fix de seleccion por target.
4. Si persiste el 401, hacer redeploy del deployment activo.
5. Reintentar login.

Checklist:

- La env var `ADMIN_PASSWORD` del target activo contiene el nuevo valor.
- `POST /api/cms/change-password` devuelve 200.
- `POST /api/cms/auth` devuelve 200 con la nueva contrasena.

## Diagnostico rapido (5 minutos)

1. En Network del navegador:
- Confirmar status de `POST /api/cms/auth`.

2. En ambiente local:
- Verificar `ADMIN_PASSWORD` en `.env.local`.

3. En Vercel:
- Validar target de la env var (`production`/`preview`/`development`).
- Confirmar que el deployment donde pruebas es el mismo target actualizado.

4. Si sigue fallando:
- Redeploy del deployment actual.
- Probar de nuevo en ventana privada para evitar ruido de estado/cookies.

## Prevencion

1. Mantener una sola fuente de verdad por entorno:
- Local: `.env.local`.
- Deploy: env vars del target correcto en Vercel.

2. Despues de cambiar contrasena:
- Confirmar login inmediatamente con la nueva contrasena.
- Verificar que la cookie anterior fue invalidada.

3. Seguridad:
- No exponer `VERCEL_TOKEN` al cliente.
- Rotar tokens si fueron compartidos por error.
- No commitear `.env.local`.

## Notas operativas

- Aunque el flujo intente aplicar el cambio sin redeploy, el comportamiento final depende del runtime activo de Vercel.
- Si hay duda de propagacion, redeploy es la salida mas confiable para asegurar que `process.env` refleje el valor nuevo.
