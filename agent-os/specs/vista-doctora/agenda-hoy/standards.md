# Agenda de Hoy — Standards aplicados

## frontend/thin-pages

`page.tsx` en el App Router es un punto de entrada mínimo. Su único trabajo es:
1. Recibir y parsear `searchParams` (en Next.js 15+, `searchParams` es `Promise<...>` — se hace `await`).
2. Aplicar lógica de fallback (fecha actual si `?fecha` ausente).
3. Renderizar exactamente **un** view component con los props necesarios.

No contiene lógica de negocio, fetching directo, ni presentación.

```ts
// apps/web/src/app/(doctor)/agenda/page.tsx
export const revalidate = 30

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha } = await searchParams
  const fechaFinal = fecha ?? new Date().toISOString().slice(0, 10)
  return <AgendaDoctorPage fecha={fechaFinal} />
}
```

---

## frontend/fsd-layer-imports

Feature-Sliced Design define un orden estricto de importaciones. Cada capa solo puede importar de las capas inferiores:

```
app → pages/views → widgets → features → entities → shared
```

En este proyecto `src/pages/` está reservado para Next.js Pages Router; se usa `src/views/` para la capa de vistas (ver memory `FSD pages layer must use src/views/`).

Reglas concretas para este feature:
- `AgendaDoctorPage` (views) importa de `widgets/agenda-timeline` y `shared/`.
- `AgendaTimelineWidget` (widgets) importa de `shared/` únicamente.
- Ninguna capa importa de una capa superior.

---

## backend/repository-pattern

Patrón de repositorio con abstract class como token de inyección (Inversify):

```ts
// domain/interfaces/agenda.repository.ts
export abstract class AgendaRepository {
  abstract getDailyAgenda(fecha: string): Promise<AgendaItem[]>
}
```

La implementación Drizzle:
- Recibe `db: DrizzleClient` inyectado.
- Método privado `toEntity(row: DailyScheduleViewRow): AgendaItem` convierte la fila de la vista a entidad de dominio.
- No expone tipos de Drizzle fuera del archivo.

Para `DailyScheduleView` (que es una vista, no una tabla), el tipo de fila se obtiene con:
```ts
type DailyScheduleViewRow = typeof dailyScheduleView.$inferSelect
// o si no está disponible en la versión de Drizzle: interfaz manual
```

---

## /tech-drizzle — rqb-select-columns

Solo se seleccionan las columnas que el caso de uso necesita. Nunca `SELECT *`:

```ts
db.select({
  slotId: view.slotId,
  startTime: view.startTime,
  endTime: view.endTime,
  patientName: view.patientName,
  bookingReason: view.bookingReason,
  status: view.status,
  mainDiagnosis: view.mainDiagnosis,
})
.from(dailyScheduleView)
.where(sql`DATE(${dailyScheduleView.startTime}) = ${fecha}`)
.orderBy(asc(dailyScheduleView.startTime))
```

---

## /next-best-practices — async params (Next.js 15+)

En Next.js 15+, `searchParams` es asíncrono. Siempre hacer `await`:

```ts
const { fecha } = await searchParams
```

Exportar `revalidate` a nivel de segmento para revalidación periódica:

```ts
export const revalidate = 30  // segundos
```

---

## /frontend-design — timeline médico

Color semántico por estado de cita:

| Estado | Color Tailwind | Significado visual |
|--------|---------------|-------------------|
| `disponible` | `bg-gray-100 border-gray-300` | Cupo libre |
| `reservado` | `bg-blue-50 border-blue-400` | Cita activa |
| `completado` | `bg-green-50 border-green-500` | Atendido |
| `cancelado` | `bg-red-50 border-red-300` | No se realizó |

Jerarquía tipográfica:
- Hora: `text-sm font-mono text-muted-foreground`
- Nombre del paciente: `text-base font-semibold`
- Motivo: `text-sm text-muted-foreground`
- Diagnóstico: `text-sm italic text-green-700`
- "Cupo disponible": `text-sm italic text-gray-400`

---

## /backend-architecture — error-handling

Usar `AppError` para errores de dominio conocidos. No lanzar errores nativos desde casos de uso:

```ts
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
  throw new AppError('Formato de fecha inválido. Use YYYY-MM-DD', 400)
}
```

El handler global de Elysia en `app.ts` captura `AppError` y devuelve `{ error: message }` con el status code correspondiente.
