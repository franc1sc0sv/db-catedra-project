# Procedimientos Almacenados — References

Los siguientes archivos del módulo `users` sirven como patrón de referencia para implementar este módulo.

## Use case pattern
`apps/api/src/modules/users/application/usecases/get-me.usecase.ts`
- Decorador `@injectable()`
- Extensión de `BaseUseCase<TInput, TOutput>`
- Lógica en `handle()`, lanzamiento de `AppError`

## Repository pattern
`apps/api/src/modules/users/infrastructure/repositories/drizzle-users.repository.ts`
- Parámetro `tx: TxClient` en cada método
- Mapper privado `toEntity(row)` que convierte `$inferSelect` a entidad de dominio
- Abstract class como token de Inversify

## Module registration
`apps/api/src/modules/users/users.module.ts`
- Implementación de `AppModule`
- Bindings de repositorio e interface con `.inRequestScope()`
- Bindings de use cases con `.toSelf().inRequestScope()`

## Route creation
`apps/api/src/modules/users/presentation/users.routes.ts`
- Patrón `createRouter`
- `container.get(UseCase).execute(input)` sin try/catch
- Sin lógica de negocio en rutas

## Schema base
`packages/db/src/schema/`
- Tablas referenciadas por los SPs: `ScheduleEvent`, `MedicalAppointments`, `Patients`, `MedicalRecords`, `ClinicalConsultations`, `WhatsAppMessage`
- Usar `$inferSelect` de estas tablas para tipar filas en el repositorio
