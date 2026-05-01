# Shape: Ver Disponibilidad

## Scope

Pantalla pública de visualización de disponibilidad semanal. Cubre:

- Endpoint API `GET /schedule-events` (público, sin auth)
- Vista RSC con grid semanal navegable por URL
- Widget de calendario con selección de slot
- Flujo de auth-redirect al seleccionar un slot sin sesión

No cubre:
- Creación o modificación de slots (admin)
- Pago o confirmación de reserva
- Notificaciones

---

## Decisiones

| Decisión | Elección | Razón |
|---|---|---|
| Navegación semanal | `searchParam week=YYYY-WW` vía `<Link>` | SSR completo, URL compartible, sin JS extra |
| Fetch de datos | Eden Treaty en RSC (server) | Sin round-trip cliente, type-safe |
| Auth check en slot click | `authClient.useSession()` en widget Client | Solo el widget necesita ser Client |
| Preservar slot tras login | `?slotId=` en URL | Sin sessionStorage, funciona en hard refresh |
| Estado vacío | Banner inline en widget | UX simple, no pantalla separada |
| Agrupación por día | En frontend (reduce lógica en API) | API retorna lista plana ordenada por tiempo |

---

## Estructura de Archivos

```
apps/
  api/src/modules/schedule-events/
    domain/entities/schedule-event.entity.ts
    domain/interfaces/schedule-events.repository.ts
    application/usecases/get-available-slots.usecase.ts
    application/dtos/outputs/available-slot.output.ts
    infrastructure/repositories/drizzle-schedule-events.repository.ts
    presentation/schedule-events.routes.ts
    schedule-events.module.ts

  web/src/
    app/disponibilidad/page.tsx
    views/disponibilidad/
      ui/DisponibilidadPage.tsx
      index.ts
    widgets/calendario-disponibilidad/
      ui/CalendarioDisponibilidadWidget.tsx
      index.ts
    entities/schedule-event/
      model/types.ts
      index.ts
```

---

## Standards Aplicados

- `frontend/thin-pages` — `page.tsx` sin lógica, solo delega a view
- `frontend/fsd-layer-imports` — views → widgets → entities → shared
- `frontend/fsd-public-api` — cada slice exporta desde `index.ts`
- `backend/repository-pattern` — abstract class token, toEntity(), TxClient
- `backend/use-case-pattern` — @injectable, BaseUseCase, handle()
- `/next-best-practices` — RSC, async searchParams, no client fetch innecesario
- `/tech-drizzle` — query builder con gte/lt, $inferSelect, relational queries
- `/tech-elysia` — validación de query params con `t.String()`, plugin sin auth
- `/frontend-design` — grid semanal con shadcn/ui, hover states, estado vacío
- `/tailwind-css-patterns` — grid CSS, hover, responsive

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| Tabla `schedule_events` no existe aún | Task 3 define entidad; se verifica existencia de tabla antes de implementar repositorio |
| Eden Treaty tipado del endpoint público | Asegurar que la ruta esté expuesta en `app.ts` antes de usar desde el frontend |
| Hidration mismatch en fechas | Formatear fechas en servidor, pasar strings al widget Client |
