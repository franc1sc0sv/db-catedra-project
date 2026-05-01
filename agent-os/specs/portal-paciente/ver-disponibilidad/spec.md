# Spec: Ver Disponibilidad

## Resumen

Primera pantalla del portal de pacientes. Muestra un calendario semanal con los horarios disponibles para agendar citas. Es una ruta pública — no requiere autenticación para visualizar. Solo expone slots con `availabilityStatus = 'available'` y `eventType = 'appointment'`.

---

## Enfoque RSC

La página `apps/web/src/app/disponibilidad/page.tsx` es un thin Server Component que delega todo el rendering a `DisponibilidadPage` (RSC). El componente de vista realiza el fetch directamente contra el API usando el cliente Eden Treaty del lado del servidor (`apps/web/src/shared/api/client.ts`), sin necesidad de `useEffect` ni estado de carga manual.

```
page.tsx (thin route) → DisponibilidadPage (RSC) → CalendarioDisponibilidadWidget (RSC/Client)
```

`DisponibilidadPage` recibe el parámetro `week` desde `searchParams` (formato `YYYY-WW`) para determinar el rango de fechas a consultar. Si `week` no está presente usa la semana actual.

---

## Patrón de Query

El endpoint `GET /schedule-events?date_from=&date_to=` filtra en base de datos:

```sql
WHERE eventType = 'appointment'
  AND availabilityStatus = 'available'
  AND startTime >= date_from
  AND startTime < date_to
ORDER BY startTime ASC
```

El usecase `GetAvailableSlotsUseCase` recibe `{ dateFrom: Date, dateTo: Date }` y devuelve un array de `AvailableSlotOutput`. El repositorio Drizzle implementa la interfaz abstracta usando `db.query` o `db.select` con condiciones `gte` / `lt` de Drizzle ORM.

Los resultados se agrupan en el frontend por fecha (`YYYY-MM-DD`) para renderizar columnas del grid semanal.

---

## Grid Semanal

`CalendarioDisponibilidadWidget` renderiza una cuadrícula donde:

- Columnas = días de la semana (lunes a domingo, con fecha visible)
- Filas = slots disponibles dentro de cada día
- Cada celda muestra hora de inicio y hora de fin
- Si una columna no tiene slots → muestra un placeholder vacío

La semana se calcula a partir del parámetro `week` (o la semana actual). Los botones "Semana anterior" / "Semana siguiente" actualizan el `searchParam` `week` mediante `<Link>` (navegación SSR sin JS adicional).

Estado vacío: si no hay slots en toda la semana → banner con texto "No hay horarios disponibles esta semana".

---

## Navegación de Semana

Los controles de navegación son `<Link>` components que apuntan a `/disponibilidad?week=YYYY-WW`. No se usa `useState` para la semana activa — el estado vive en la URL, lo que permite SSR completo y URLs compartibles.

---

## Flujo de Auth-Redirect al Click en Slot

1. Usuario hace click en un slot disponible.
2. El widget (`'use client'`) consulta la sesión con `authClient.useSession()`.
3. **Si autenticado:** navega a `/reservar-cita?slotId=<id>` (preseleccionado).
4. **Si no autenticado:** muestra un `Dialog` de shadcn/ui con el mensaje "Inicia sesión para reservar" y botón que redirige a `/login?redirect=/reservar-cita&slotId=<id>`.
5. Tras login exitoso, el flujo de auth redirige de vuelta a `/reservar-cita?slotId=<id>` con el slot preservado en la URL.

El `slotId` viaja exclusivamente como query param — no se usa `sessionStorage` ni estado efímero.

---

## Contratos de Datos

### Output DTO (API)
```ts
interface AvailableSlotOutput {
  id: string
  startTime: string  // ISO 8601
  endTime: string    // ISO 8601
  doctorName?: string
  specialty?: string
}
```

### Tipo Entidad (Frontend)
```ts
interface ScheduleEvent {
  id: string
  startTime: Date
  endTime: Date
  doctorName?: string
  specialty?: string
}
```

---

## Consideraciones

- El endpoint es público (sin middleware de auth en Elysia).
- El widget de calendario tiene `'use client'` solo para el manejo del click y la consulta de sesión; el grid en sí puede ser RSC estático si se extrae el shell.
- Todos los textos visibles al usuario están en español.
- Todos los componentes UI usan `@/components/ui/` (shadcn/ui).
