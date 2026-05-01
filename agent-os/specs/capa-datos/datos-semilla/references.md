# References — Datos Semilla

## Schema (tablas a sembrar)

Todas las tablas están definidas en `packages/db/src/schema/`:

| Tabla | Archivo |
|---|---|
| MedicalInsurances | `packages/db/src/schema/medical-insurances.ts` |
| Users | `packages/db/src/schema/users.ts` |
| Patients | `packages/db/src/schema/patients.ts` |
| MedicalRecords | `packages/db/src/schema/medical-records.ts` |
| ScheduleEvents | `packages/db/src/schema/schedule-events.ts` |
| MedicalAppointments | `packages/db/src/schema/medical-appointments.ts` |
| WhatsAppMessages | `packages/db/src/schema/whatsapp-messages.ts` |
| ClinicalConsultations | `packages/db/src/schema/clinical-consultations.ts` |

El barrel de exportaciones está en `packages/db/src/schema/index.ts`.

## Patrón de insert (referencia)

`apps/api/src/modules/users/infrastructure/repositories/drizzle-users.repository.ts` — muestra el patrón `db.insert(table).values({...}).returning()` usado en el proyecto. El seed sigue el mismo patrón pero con arrays de valores en lugar de objetos únicos.

## Cliente Drizzle

`packages/db/src/index.ts` — exporta el cliente `db` y la conexión configurada. El seed importa `db` desde aquí.

## Enums relevantes

Consultar los archivos de schema para los valores exactos de:
- `coverageType` en `medical-insurances.ts`
- `role` y `accountStatus` en `users.ts`
- `status` en `schedule-events.ts`

## Documentación externa

- Drizzle inserts: https://orm.drizzle.team/docs/insert
- Drizzle transactions: https://orm.drizzle.team/docs/transactions
- Drizzle select count: `db.select({ count: sql\`count(*)\` }).from(table)`
