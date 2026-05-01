# References: Configurar Horarios

## Frontend — Patrones a seguir

### Client Component con react-hook-form + shadcn
`apps/web/src/features/auth/ui/LoginForm.tsx`
Modelo para `ConfigurarHorariosForm.tsx`: estructura `'use client'`, `useForm`, `zodResolver`, campos shadcn.

### View con shadcn Card
`apps/web/src/views/login/ui/LoginPage.tsx`
Modelo para `ConfigurarHorariosPage.tsx`: composición de vista usando `Card`, `CardHeader`, `CardContent`.

### Cliente Eden Treaty (mutations)
`apps/web/src/shared/api/client.ts`
Instancia `clientApi` usada para llamadas POST desde Client Components. Importar aquí para llamar `/schedule-events/preview` y `/schedule-events/generate`.

---

## API — Patrones a seguir

### BaseUseCase pattern
`apps/api/src/modules/users/application/usecases/get-me.usecase.ts`
Modelo para `GenerateWeeklyScheduleUseCase`: `@injectable`, extiende `BaseUseCase`, lógica en `handle()`.

### Route pattern con auth macro
`apps/api/src/modules/users/presentation/users.routes.ts`
Modelo para `schedule-events.routes.ts`: estructura de rutas Elysia con macro de autenticación y tipado de entrada/salida.

### AppModule binding (Inversify)
`apps/api/src/modules/users/users.module.ts`
Modelo para registrar `GenerateWeeklyScheduleUseCase` y su repositorio en `ScheduleEventsModule.load()`.

---

## Schema de base de datos

El módulo `schedule-events` (creado en iter ver-disponibilidad) define la tabla `ScheduleEvents` con campos:
- `id`, `doctorId`, `patientId` (nullable), `startDatetime`, `endDatetime`
- `eventType` (`'appointment'` | `'block'`)
- `availabilityStatus` (`'available'` | `'booked'` | `'cancelled'`)
- `googleEventId`, `googleHtmlLink`, `syncStatus` (para integración GCal)

Ubicación esperada: `apps/api/src/modules/schedule-events/infrastructure/db/schedule-events.schema.ts`

Si el módulo no existe aún, crear schema completo siguiendo el estándar `schema-one-table-per-file` de `/tech-drizzle`.
