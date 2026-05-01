# Standards: Configurar Horarios

## frontend/entity-schemas

Zod schemas en `entities/[name]/model/schemas.ts`. Exportar schema + tipo inferido desde `index.ts`.

```ts
// entities/schedule-event/model/schemas.ts
import { z } from 'zod'

export const slotDurationSchema = z.union([
  z.literal(15), z.literal(30), z.literal(45), z.literal(60)
])

export const generateScheduleInputSchema = z.object({
  selectedDays: z.array(z.number().int().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: slotDurationSchema,
  weekStartDate: z.string().datetime(),
})

export const scheduleSlotPreviewSchema = z.object({
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
})

export const generateScheduleOutputSchema = z.object({
  preview: z.array(scheduleSlotPreviewSchema),
  created: z.number().int(),
  skipped: z.number().int(),
})
```

---

## frontend/fsd-public-api

Cada slice tiene `index.ts` como único punto de importación. Nada importa directamente desde subcarpetas internas.

```ts
// entities/schedule-event/index.ts
export type { GenerateScheduleInput, GenerateScheduleOutput, ScheduleSlotPreview } from './model/types'
export { generateScheduleInputSchema, generateScheduleOutputSchema } from './model/schemas'
```

---

## frontend/thin-pages

`page.tsx` renderiza un único componente de vista. No contiene lógica ni fetching propio.

```tsx
// app/(doctor)/horarios/page.tsx
import { ConfigurarHorariosPage } from '@/views/configurar-horarios'
export default function HorariosPage() {
  return <ConfigurarHorariosPage />
}
```

---

## backend/use-case-pattern

`@injectable`, extiende `BaseUseCase<TInput, TOutput>`. La lógica va en `handle()`. `AppError` para errores de negocio. `execute()` envuelve en transacción si aplica.

```ts
@injectable()
export class GenerateWeeklyScheduleUseCase extends BaseUseCase<
  GenerateScheduleInput,
  GenerateScheduleOutput
> {
  constructor(
    @inject(SCHEDULE_EVENT_REPOSITORY) private readonly repo: IScheduleEventRepository
  ) { super() }

  protected async handle(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
    const candidates = calculateSlots(input)
    const overlapping = await this.repo.findOverlapping(candidates)
    const toInsert = candidates.filter(c => !overlapping.has(c.startDatetime))
    await this.repo.bulkInsert(toInsert)
    return { preview: [], created: toInsert.length, skipped: overlapping.size }
  }
}
```

---

## backend/repository-pattern

Abstract class como token Inversify. Método `toEntity()` como mapper. `TxClient` para operaciones transaccionales.

```ts
export abstract class IScheduleEventRepository {
  abstract findOverlapping(slots: SlotCandidate[]): Promise<Set<string>>
  abstract bulkInsert(slots: SlotCandidate[], tx?: TxClient): Promise<void>
}
```

---

## backend/error-handling

Solo `AppError`. Nunca `try/catch` en rutas ni use cases. El handler global en `app.ts` captura todo.

```ts
// Correcto — lanzar AppError
if (input.endTime <= input.startTime) {
  throw new AppError('La hora de fin debe ser posterior a la hora de inicio', 400)
}

// Incorrecto — nunca hacer esto en rutas o use cases
try {
  await useCase.execute(input)
} catch (e) {
  return { error: e.message }
}
```

---

## backend/module-registration

`AppModule.load()` vincula repositorio y use cases. Dos pasos manuales: registrar en `bootstrap.ts` + montar rutas en `app.ts`.

```ts
// schedule-events.module.ts
export class ScheduleEventsModule implements ContainerModule {
  load(bind: interfaces.Bind) {
    bind(SCHEDULE_EVENT_REPOSITORY).to(DrizzleScheduleEventRepository).inSingletonScope()
    bind(GenerateWeeklyScheduleUseCase).toSelf().inTransientScope()
  }
}
```

---

## tech-drizzle: migration-transaction-safety

Envolver operaciones multi-escritura en `db.transaction()` para atomicidad.

```ts
await db.transaction(async (tx) => {
  await tx.insert(scheduleEvents).values(toInsert)
})
```

---

## tech-drizzle: rqb-prefer-relational

Usar `db.query` para lecturas con relaciones. Para overlap detection usar el query builder SQL (`db.select`) ya que requiere condiciones de intervalo complejas.

```ts
const overlapping = await db.select()
  .from(scheduleEvents)
  .where(
    and(
      eq(scheduleEvents.doctorId, doctorId),
      lt(scheduleEvents.startDatetime, candidateEnd),
      gt(scheduleEvents.endDatetime, candidateStart),
    )
  )
```

---

## vercel-react-best-practices: rendering-usetransition-loading

Usar `useTransition` en lugar de `useState` manual para estados de carga. Proporciona `isPending` incorporado.

```tsx
const [isPending, startTransition] = useTransition()

function onConfirm() {
  startTransition(async () => {
    const result = await generateSchedule(formData)
    toast.success(`${result.created} horarios creados. ${result.skipped} ignorados por solapamiento.`)
  })
}
```
