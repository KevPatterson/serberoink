# Error de stale closures en Portfolio (Admin CMS)

## Resumen rapido

Este incidente ocurre cuando una accion en el panel admin usa una referencia vieja de `content` (closure stale) al guardar o eliminar imagenes en Portfolio.

Sintoma tipico:

- El usuario elimina o reordena imagenes.
- Visualmente el estado parece correcto en pantalla.
- Al guardar, GitHub recibe una version anterior de `content` y el cambio no persiste.

## Impacto

- Perdida de cambios en Portfolio.
- Inconsistencia entre UI local y contenido real en `public/content/content.json`.
- Friccion operativa en el flujo de CMS.

## Causa raiz

En React, un handler puede capturar valores de estado del render anterior.
Si el callback usa `content` cerrado por closure (en lugar del estado actual), puede persistir datos viejos.

Casos detectados en este proyecto:

1. Eliminacion de imagen:
- Se eliminaba solo en estado local y quedaba pendiente del boton Guardar.
- Si el `content` usado por persistencia era stale, la eliminacion no llegaba a GitHub.

2. Boton Guardar en Portfolio:
- `onSave={() => persistContent(content, ...)}` podia usar `content` capturado en render previo.
- En reorder rapido (drag and drop + guardar), podia guardar el orden anterior.

## Archivos relevantes

- `src/app/admin/page.tsx`
- `src/app/api/cms/update/route.ts`

## Fix aplicado

### 1) Persistir eliminacion inmediatamente

Cuando el usuario confirma eliminar:

1. Construir `nextContent` con la imagen removida.
2. Ejecutar `setContent(nextContent)`.
3. Llamar `persistContent(nextContent, 'cms: delete image')` en ese mismo flujo.

Resultado:

- La persistencia usa el estado correcto en el momento de la accion.
- No depende de que el usuario pulse Guardar despues.

### 2) Pasar estado actual al guardar Portfolio

Se ajusto la firma de `onSave` para recibir el contenido actual:

- `onSave: (currentContent: SiteContent) => void`

Y `SaveButton` llama:

- `onClick={() => onSave(content)}`

Resultado:

- Guardar siempre persiste el `content` vigente en ese render.
- Se evita el stale closure del handler definido en el padre.

## Como reproducir el bug antiguo

1. Abrir `/admin` y entrar a seccion Portfolio.
2. Eliminar una imagen o reordenar por drag and drop.
3. Guardar rapido.
4. Revisar `content.json` en GitHub: podia quedar sin el cambio esperado.

## Como validar que el fix funciona

### Escenario A: eliminacion

1. Eliminar una imagen desde Portfolio.
2. Confirmar en el toast.
3. Verificar que se dispara persistencia inmediata.
4. Confirmar en GitHub que la imagen ya no esta en `content.json`.

### Escenario B: reorder + guardar

1. Reordenar varias imagenes.
2. Pulsar Guardar inmediatamente.
3. Verificar que el orden guardado en GitHub coincide con la UI.

## Checklist de diagnostico

1. Revisar si el handler usa estado capturado en closure (`content` del render viejo).
2. Confirmar que la persistencia reciba un objeto `nextContent` explicito.
3. Verificar que acciones criticas (delete) no dependan de un guardado posterior.
4. Validar en Network el request a `/api/cms/update` con payload correcto.

## Prevencion

1. Para acciones criticas, persistir en el mismo callback que construye `nextContent`.
2. Evitar callbacks que dependan de estado potencialmente stale cuando hay interaccion rapida.
3. Preferir pasar estado actual como argumento en handlers de guardado.
4. En cambios de UX de CMS, testear interacciones rapidas (drag/drop + save, delete + save).

## Nota de implementacion

Este fix no cambia contratos del backend; corrige el flujo de estado en frontend para que la persistencia reciba siempre el dato mas reciente.
