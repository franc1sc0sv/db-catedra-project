# References: Agenda Diaria

## Frontend — patrones existentes

### ReceptionistDashboardPage (view pattern)
`apps/web/src/views/dashboard-receptionist/ui/ReceptionistDashboardPage.tsx`
View RSC existente para la secretaria. Muestra el patrón de composición: guard de auth en server, props mínimas desde page.tsx, widgets como children.

### LoginPage (shadcn composition)
`apps/web/src/views/login/ui/LoginPage.tsx`
Ejemplo de composición de componentes shadcn/ui en una view. Referencia para Card, Button, Input patterns en esta codebase.

### Auth guard servidor
`apps/web/src/shared/auth/guards.server.ts`
Exporta helpers de autenticación para RSC. Usar `requireReceptionistOrAdmin()` (o el helper equivalente de rol) antes de hacer fetch en `AgendaSecretariaPage`.

### Eden Treaty API client (server)
`apps/web/src/shared/api/client.ts`
Singleton del cliente Eden Treaty configurado para uso en RSC. Invocar como `api.agenda.get({ query: { fecha } })` para llamar al endpoint del API.

---

## Backend — módulo agenda

### Módulo agenda (raíz)
`apps/api/src/modules/agenda/`
Módulo existente con repositorio, use cases y rutas de agenda. La tarea extiende este módulo añadiendo el use case y DTO de receptionist.

### DailyScheduleView (Drizzle view)
Localizar en `apps/api/src/modules/agenda/infrastructure/` o `apps/api/src/shared/db/schema/`.
View Drizzle que consolida slots con reservas. Columnas clave: `startTime`, `endTime`, `availabilityStatus`, `patientName`, `bookingReason`, `whatsappPhone`, `appointmentId`, `slotId`.

### Patrón use case existente
Revisar cualquier use case en `apps/api/src/modules/agenda/application/usecases/` para seguir el mismo patrón de inyección Inversify y firma de método `execute()`.

### Binding Inversify del módulo
`apps/api/src/modules/agenda/agenda.module.ts`
Registrar `GetDailyAgendaReceptionistUseCase` en este archivo al completar Task 3.
