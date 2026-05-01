# Standards: Ver Disponibilidad

## frontend/thin-pages

`page.tsx` solo parsea params y renderiza un único componente view. Sin lógica de negocio, sin fetch directo, sin estado.

```tsx
// apps/web/src/app/disponibilidad/page.tsx
import { DisponibilidadPage } from '@/views/disponibilidad'

export default async function DisponibilidadRoute({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  return <DisponibilidadPage week={week} />
}
```

---

## frontend/fsd-layer-imports

Orden estricto de importaciones entre capas FSD. Nunca importar hacia arriba ni entre slices del mismo nivel.

```
app → views → widgets → features → entities → shared
```

`DisponibilidadPage` (views) puede importar de `widgets/calendario-disponibilidad` y de `entities/schedule-event`. El widget no importa de views.

---

## frontend/fsd-public-api

Cada slice expone un único punto de entrada `index.ts`. Nunca importar directamente desde sub-paths.

```ts
// Correcto
import { CalendarioDisponibilidadWidget } from '@/widgets/calendario-disponibilidad'

// Incorrecto
import { CalendarioDisponibilidadWidget } from '@/widgets/calendario-disponibilidad/ui/CalendarioDisponibilidadWidget'
```

---

## backend/repository-pattern

Abstract class usada como token de inyección. El repositorio concreto implementa la interfaz. Método `toEntity()` privado para mapear filas de DB a entidades de dominio. Soporte opcional de `TxClient`.

```ts
// domain/interfaces/schedule-events.repository.ts
export abstract class IScheduleEventsRepository {
  abstract findAvailable(dateFrom: Date, dateTo: Date): Promise<ScheduleEventEntity[]>
}

// infrastructure/repositories/drizzle-schedule-events.repository.ts
@injectable()
export class DrizzleScheduleEventsRepository implements IScheduleEventsRepository {
  constructor(@inject(DB_TOKEN) private db: DrizzleDB) {}

  async findAvailable(dateFrom: Date, dateTo: Date): Promise<ScheduleEventEntity[]> {
    const rows = await this.db
      .select()
      .from(scheduleEventsTable)
      .where(
        and(
          eq(scheduleEventsTable.eventType, 'appointment'),
          eq(scheduleEventsTable.availabilityStatus, 'available'),
          gte(scheduleEventsTable.startTime, dateFrom),
          lt(scheduleEventsTable.startTime, dateTo),
        )
      )
      .orderBy(asc(scheduleEventsTable.startTime))
    return rows.map(this.toEntity)
  }

  private toEntity(row: typeof scheduleEventsTable.$inferSelect): ScheduleEventEntity {
    return new ScheduleEventEntity(row)
  }
}
```

---

## backend/use-case-pattern

Use case `@injectable`, extiende `BaseUseCase<Input, Output>`, lógica en `handle()`. Lanza `AppError` para errores de dominio. No atrapa excepciones de infraestructura (el handler global de Elysia las maneja).

```ts
@injectable()
export class GetAvailableSlotsUseCase extends BaseUseCase<
  { dateFrom: Date; dateTo: Date },
  AvailableSlotOutput[]
> {
  constructor(
    @inject(IScheduleEventsRepository)
    private repo: IScheduleEventsRepository,
  ) {
    super()
  }

  async handle({ dateFrom, dateTo }: { dateFrom: Date; dateTo: Date }): Promise<AvailableSlotOutput[]> {
    const slots = await this.repo.findAvailable(dateFrom, dateTo)
    return slots.map(slot => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      doctorName: slot.doctorName,
      specialty: slot.specialty,
    }))
  }
}
```

---

## /next-best-practices — RSC y async searchParams

En Next.js 15+, `searchParams` es una Promise. Siempre `await` antes de desestructurar.

```ts
// Correcto
const { week } = await searchParams

// Incorrecto (Next.js 15+ lanza warning)
const { week } = searchParams
```

Los Server Components pueden `fetch` / llamar al cliente Eden directamente — sin `useEffect`, sin `useState`.

---

## /tech-drizzle — Query con filtros y tipos inferidos

Usar `$inferSelect` para el tipo de fila. Usar `gte`, `lt`, `eq`, `and` de `drizzle-orm` para condiciones. Usar `.orderBy(asc(...))` para ordenar resultados.

```ts
type ScheduleEventRow = typeof scheduleEventsTable.$inferSelect
```

Para queries relacionales simples preferir `db.query` API; para aggregaciones y filtros complejos preferir `db.select`.

---

## /tech-elysia — Rutas públicas con validación de query

```ts
// presentation/schedule-events.routes.ts
export const scheduleEventsRoutes = new Elysia({ prefix: '/schedule-events' })
  .get('/', async ({ query, store }) => {
    const { date_from, date_to } = query
    const useCase = container.get(GetAvailableSlotsUseCase)
    return useCase.handle({
      dateFrom: new Date(date_from),
      dateTo: new Date(date_to),
    })
  }, {
    query: t.Object({
      date_from: t.String(),
      date_to: t.String(),
    }),
  })
```

Sin plugin de auth — el endpoint es público.

---

## /frontend-design — Grid semanal con shadcn/ui

Usar CSS Grid con 7 columnas (una por día). Cada celda de slot usa `Card` de shadcn/ui con clases Tailwind para hover y selección. Encabezados de columna muestran nombre de día + fecha.

```tsx
<div className="grid grid-cols-7 gap-2">
  {days.map(day => (
    <div key={day.iso} className="flex flex-col gap-1">
      <div className="text-center text-sm font-medium text-muted-foreground">
        {day.label}
      </div>
      {day.slots.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground py-4">—</div>
      ) : (
        day.slots.map(slot => (
          <button
            key={slot.id}
            onClick={() => onSlotClick(slot)}
            className="rounded-md border border-border bg-card p-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="block font-medium">{formatTime(slot.startTime)}</span>
            <span className="block text-xs text-muted-foreground">{formatTime(slot.endTime)}</span>
          </button>
        ))
      )}
    </div>
  ))}
</div>
```

---

## /tailwind-css-patterns — Hover y estados de selección

Para celdas de slot: `hover:bg-accent hover:text-accent-foreground` (tokens shadcn/ui). Para slot seleccionado: `bg-primary text-primary-foreground`. Transición suave: `transition-colors duration-150`.
