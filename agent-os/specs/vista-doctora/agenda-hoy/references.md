# Agenda de Hoy — References

## Frontend — patrones existentes

### Vista de doctor existente
`apps/web/src/views/dashboard-doctor/ui/DoctorDashboardPage.tsx`
Patrón de view component RSC para el rol doctora. Referencia para estructura, guard de autenticación y convenciones de naming.

### Página de login con shadcn
`apps/web/src/views/login/ui/LoginPage.tsx`
Ejemplo de view component que usa exclusivamente componentes de `@/components/ui/`. Referencia para imports de shadcn y estructura de archivo.

### Cliente Eden Treaty (servidor)
`apps/web/src/shared/api/client.ts`
Singleton del cliente Eden Treaty para llamadas desde Server Components. Usar este cliente en `AgendaDoctorPage` para `api.agenda.get(...)`.

### Guard de autenticación servidor
`apps/web/src/shared/auth/guards.server.ts`
Función que verifica sesión y rol en Server Components. Llamar al inicio de `AgendaDoctorPage` antes del fetch.

---

## Backend — patrones existentes

### Repositorio Drizzle de usuarios
`apps/api/src/modules/users/infrastructure/repositories/drizzle-users.repository.ts`
Patrón de implementación de repositorio con Drizzle: inyección de `db`, método `toEntity()`, tipado con `$inferSelect`. Copiar estructura para `DrizzleAgendaRepository`.

---

## Base de datos — vista a consultar

`DailyScheduleView` — vista Drizzle que combina:
- Slots de horario de la doctora
- Reservas de pacientes (`Bookings`)
- Consultas clínicas (`ClinicalConsultations`) para el campo `mainDiagnosis`

Buscar la definición en `apps/api/src/db/schema/` o `apps/api/src/db/views/` según la convención del proyecto.

---

## Archivos a crear (referencia de paths)

```
Frontend:
  apps/web/src/app/(doctor)/agenda/page.tsx
  apps/web/src/views/agenda-doctora/ui/AgendaDoctorPage.tsx
  apps/web/src/views/agenda-doctora/index.ts
  apps/web/src/widgets/agenda-timeline/ui/AgendaTimelineWidget.tsx
  apps/web/src/widgets/agenda-timeline/index.ts

API:
  apps/api/src/modules/agenda/agenda.module.ts
  apps/api/src/modules/agenda/domain/entities/agenda-item.entity.ts
  apps/api/src/modules/agenda/domain/interfaces/agenda.repository.ts
  apps/api/src/modules/agenda/application/usecases/get-daily-agenda.usecase.ts
  apps/api/src/modules/agenda/application/dtos/outputs/agenda-item.output.ts
  apps/api/src/modules/agenda/infrastructure/repositories/drizzle-agenda.repository.ts
  apps/api/src/modules/agenda/presentation/agenda.routes.ts

Registro:
  apps/api/src/bootstrap.ts  ← añadir AgendaModule
  apps/api/src/app.ts        ← registrar agenda.routes plugin
```
