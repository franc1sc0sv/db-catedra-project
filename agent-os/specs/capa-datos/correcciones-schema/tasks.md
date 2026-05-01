# Correcciones de Schema — Tasks

- [x] Guardar documentación del spec (hecho por este agente)

- [x] Modificar `packages/db/src/schema/patients.schema.ts`: eliminar `.notNull()` de `userId` para permitir pacientes sin cuenta web → `/tech-drizzle`

- [x] Modificar `packages/db/src/schema/medical-records.schema.ts`: eliminar `.notNull()` de `bloodType` para que el trigger `trg_create_medical_record` pueda insertar con `bloodType = NULL` → `/tech-drizzle`

- [x] Modificar `packages/db/src/schema/enums.ts`: añadir `'completed'` y `'cancelled'` al array de `availabilityStatusEnum` para que `sp_cancel_appointment` y `sp_complete_consultation` puedan actualizar el estado del evento → `/tech-drizzle`

- [x] Generar la migración: `pnpm --filter @project/db db:generate` y revisar el SQL generado en `packages/db/src/migrations/` antes de continuar, especialmente la migración del enum (debe usar `CREATE TYPE` con los cinco valores) → `/tech-drizzle`

- [x] Aplicar la migración: `pnpm --filter @project/db db:migrate` y verificar que los tres `ALTER` se ejecutan sin error → `/tech-drizzle`

- [x] Verificar en base de datos que `Patients.userId` admite NULL, `MedicalRecords.bloodType` admite NULL, y el enum `availability_status` incluye los cinco valores → `/tech-drizzle`

> Implementación completada: 2026-04-28
