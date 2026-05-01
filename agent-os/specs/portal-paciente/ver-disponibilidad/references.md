# References: Ver Disponibilidad

## Frontend — Patrones existentes a seguir

### View composition con shadcn Card
`apps/web/src/views/login/ui/LoginPage.tsx`
Modelo de cómo componer una view usando `Card`, `CardHeader`, `CardContent` de shadcn/ui. `DisponibilidadPage` sigue la misma estructura de composición.

### Client Component pattern
`apps/web/src/features/auth/ui/LoginForm.tsx`
Ejemplo de Client Component con manejo de estado y llamadas al cliente. `CalendarioDisponibilidadWidget` sigue este patrón para la interacción de click y consulta de sesión.

### Eden Treaty API client (server RSC)
`apps/web/src/shared/api/client.ts`
Singleton del cliente Eden Treaty para usar en Server Components. `DisponibilidadPage` importa este cliente para llamar a `GET /schedule-events`.

### Thin page pattern
`apps/web/src/app/(auth)/login/page.tsx`
Thin route que solo pasa props a la view. `apps/web/src/app/disponibilidad/page.tsx` sigue exactamente este patrón, con la diferencia de que es una ruta pública (sin grupo de auth).

---

## Backend — Módulos existentes como referencia de estructura

Si existen módulos en `apps/api/src/modules/`, su estructura (entity, interface, usecase, dto, repo, routes, module) es el modelo exacto para `schedule-events`.

### Bootstrap y app
- `apps/api/src/bootstrap.ts` — donde registrar el módulo `ScheduleEventsModule`
- `apps/api/src/app.ts` — donde montar `scheduleEventsRoutes` con `.use()`

---

## Tabla de base de datos esperada

La tabla `schedule_events` debe tener al menos estas columnas para que el repositorio funcione:

| columna | tipo | notas |
|---|---|---|
| id | uuid / text | PK |
| event_type | text | filtrar por `'appointment'` |
| availability_status | text | filtrar por `'available'` |
| start_time | timestamp | rango de fechas |
| end_time | timestamp | mostrado en UI |
| doctor_id | uuid / text | FK opcional |

Si la tabla no existe, crear el schema Drizzle y la migración antes de implementar el repositorio.

---

## Dependencias de paquetes

No se requieren dependencias nuevas. Todo el stack ya está presente:
- `elysia` + `@elysiajs/eden` — API y cliente
- `drizzle-orm` — queries
- `better-auth` — session check en widget Client
- `shadcn/ui` (`@/components/ui/`) — Card, Button, Dialog, Link
- `tailwindcss` — estilos del grid
