# Shape: Agenda Diaria

## Scope
Pantalla de agenda diaria para la secretaria/admin. Lectura de todos los slots del día con colores de estado, navegación por fecha y puntos de entrada a cancelación y creación manual de turnos. No incluye los flujos de cancelación ni creación (specs separados).

## Decisiones de diseño

### Reutilizar módulo agenda existente vs módulo separado
**Decisión: extender el módulo agenda existente.**
Se añade un use case y DTO específico para receptionist dentro de `apps/api/src/modules/agenda/`. La vista `DailyScheduleView` ya existe. Evita duplicar lógica de dominio.

### Layout: tabla vs timeline visual
**Decisión: tabla HTML (shadcn Table).**
La secretaria necesita escaneo rápido por columna (hora, estado, paciente). Una timeline visual aporta estética pero reduce densidad informativa. La tabla permite ordenar y añadir columnas en iteraciones futuras.

### Colores de estado: fila completa vs badge solamente
**Decisión: fondo de fila + badge de texto.**
El fondo coloreado permite lectura periférica rápida de la distribución del día. El badge mantiene el texto del estado legible en cualquier resolución.

### Navegación de fecha: client-side state vs searchParams
**Decisión: searchParams (`?fecha=YYYY-MM-DD`).**
Permite bookmarking, compartir URL, y re-fetch automático en RSC sin estado client-side adicional. El componente `DateNav` es un Client Component ligero que solo empuja la nueva URL.

### Distinción sin-agenda vs agenda-vacía
**Decisión: verificar `items.length === 0` en el widget.**
La API devuelve array vacío en ambos casos de "sin slots" (no hay configuración). La UI diferencia via mensaje descriptivo. No se añade campo extra a la respuesta de la API.

## Standards aplicados
- `frontend/thin-pages` — page.tsx delega en la view
- `frontend/fsd-layer-imports` — views → widgets → shared
- `backend/repository-pattern` — abstract class token, toEntity mapper, DailyScheduleView como Drizzle view
- `backend/use-case-per-operation` — use case dedicado para receptionist
