# Standards: Reservar Cita

## frontend/entity-schemas

Zod schemas viven en `entities/[name]/model/schemas.ts`. Las features importan tipos e schemas únicamente desde el public API del entity slice (`entities/[name]/index.ts`). No se definen schemas inline en componentes ni en features.

**Aplicación en esta feature:**
- `apps/web/src/entities/appointment/model/schemas.ts` — `bookAppointmentSchema`, `appointmentOutputSchema`
- `apps/web/src/entities/appointment/model/types.ts` — tipos inferidos con `z.infer<>`
- `apps/web/src/entities/appointment/index.ts` — re-exporta todo lo anterior

---

## frontend/fsd-public-api

Cada slice (entity, feature, view, widget) expone un único archivo `index.ts` como punto de entrada. Nunca importar desde rutas internas de otro slice.

**Correcto:**
```ts
import { bookAppointmentSchema } from '@/entities/appointment'
import { ReservarCitaForm } from '@/features/booking'
```

**Incorrecto:**
```ts
import { bookAppointmentSchema } from '@/entities/appointment/model/schemas'
```

---

## frontend/thin-pages

`page.tsx` en App Router no contiene lógica de negocio ni UI directa. Su única responsabilidad es:
1. Extraer parámetros de ruta (`params`, `searchParams`)
2. Renderizar el view component correspondiente

```tsx
// apps/web/src/app/(patient)/reservar/[eventId]/page.tsx
import { ReservarCitaPage } from '@/views/reservar-cita'

export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  return <ReservarCitaPage eventId={eventId} />
}
```

---

## backend/use-case-pattern

Cada use case:
- Es una clase con `@injectable()`
- Extiende `BaseUseCase<TInput, TOutput>`
- Implementa `handle(input: TInput): Promise<TOutput>`
- Lanza `AppError` para errores de dominio; no hace try/catch
- Recibe dependencias vía constructor injection de Inversify

```ts
@injectable()
export class BookAppointmentUseCase extends BaseUseCase<BookAppointmentInput, AppointmentOutput> {
  constructor(
    @inject(APPOINTMENTS_REPOSITORY) private appointments: IAppointmentsRepository,
    @inject(SCHEDULE_EVENTS_REPOSITORY) private scheduleEvents: IScheduleEventsRepository,
  ) { super() }

  async handle(input: BookAppointmentInput): Promise<AppointmentOutput> {
    // validación → INSERT → UPDATE → INSERT (en transacción)
    // lanzar AppError para casos de error
  }
}
```

---

## backend/repository-pattern

- La interfaz es una clase abstracta (token Inversify)
- La implementación Drizzle extiende la clase abstracta
- `toEntity()` es un método privado que mapea `$inferSelect` → entidad de dominio
- Las operaciones transaccionales reciben un `TxClient` opcional

```ts
export abstract class IAppointmentsRepository {
  abstract book(data: BookAppointmentInput, tx: TxClient): Promise<AppointmentEntity>
  abstract findByEventId(eventId: string): Promise<AppointmentEntity | null>
}
```

---

## backend/error-handling

- Lanzar siempre `AppError(code, statusCode)` — nunca strings ni Error genéricos
- El global error handler en `app.ts` (Elysia `onError`) traduce `AppError` a respuesta HTTP
- Nunca envolver en try/catch dentro de routes ni use cases
- Los repositorios convierten errores de DB (ej. violación de constraint único) en `AppError` con código descriptivo

```ts
// En el repositorio — único lugar donde se captura error de DB
try {
  return await db.insert(medicalAppointments).values(data).returning()
} catch (err) {
  if (isUniqueConstraintError(err)) {
    throw new AppError('SLOT_TAKEN', 409, 'Ese cupo ya no está disponible')
  }
  throw err
}
```

Códigos de error para esta feature:
| Código | HTTP | Mensaje en español |
|---|---|---|
| `SLOT_UNAVAILABLE` | 409 | Ese cupo ya no está disponible, elige otro horario |
| `SLOT_TAKEN` | 409 | Ese cupo ya no está disponible, elige otro horario |
| `PROFILE_INCOMPLETE` | 422 | Debes completar tu perfil antes de reservar |
