# Spec: Roles de PostgreSQL

## Descripción

Define cuatro roles PostgreSQL con privilegios diferenciados a nivel de motor de base de datos, como mecanismo de defensa en profundidad. Cumple el criterio 7 del rubric de evaluación.

## Roles y Privilegios

### rol_paciente

- `SELECT` sobre `ScheduleEvents` (únicamente filas disponibles vía RLS o vista con SECURITY BARRIER)
- `INSERT` sobre `MedicalAppointments`
- Sin acceso a: `MedicalRecords`, `ClinicalConsultations`, `Users`, ni datos de otros pacientes

### rol_secretaria

- `SELECT`, `INSERT`, `UPDATE` sobre: `Patients`, `ScheduleEvents`, `MedicalAppointments`, `WhatsAppMessages`
- `SELECT` sobre: `Users`, `MedicalInsurances`
- Sin acceso a: `ClinicalConsultations`
- Restricción a nivel de columna: no se otorga acceso a la columna `doctorPrivateNotes` de `ClinicalConsultations`

### rol_doctora

- CRUD completo (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) sobre: `MedicalRecords`, `ClinicalConsultations` (incluyendo `doctorPrivateNotes`)
- CRUD completo sobre: `ScheduleEvents`
- `SELECT` sobre: `Patients`, `MedicalInsurances`
- Sin acceso a tablas de autenticación: `Users`, `Sessions`, `Accounts`

### rol_admin

- `ALL PRIVILEGES` sobre todas las tablas del esquema

## Implementación

Los roles se crean con `CREATE ROLE ... WITH LOGIN PASSWORD '...'` y se asignan privilegios con `GRANT ... ON TABLE ... TO ...`.

Drizzle ORM no gestiona roles PostgreSQL de forma nativa. Por eso la implementación va en un archivo SQL numerado independiente ubicado en `packages/db/src/migrations/`, aplicado vía `db.execute(sql\`...\`)` o directamente con `psql`.

### Restricción de columna para rol_secretaria

PostgreSQL no permite DENY por columna directamente. La restricción se implementa otorgando `SELECT` únicamente sobre las columnas permitidas de `ClinicalConsultations`, excluyendo `doctorPrivateNotes`:

```sql
GRANT SELECT (id, patient_id, doctor_id, consultation_date, diagnosis, treatment)
  ON TABLE "ClinicalConsultations" TO rol_secretaria;
-- doctorPrivateNotes queda excluida
```

### RLS vs SECURITY BARRIER para rol_paciente

Para `ScheduleEvents`, `rol_paciente` solo debe ver sus propias filas. Las opciones son:

- **Row Level Security (RLS):** política `USING (patient_id = current_setting('app.current_user_id')::uuid)`. Requiere activar `ALTER TABLE "ScheduleEvents" ENABLE ROW LEVEL SECURITY`.
- **SECURITY BARRIER view:** vista que filtra por `patient_id`. El rol recibe `SELECT` sobre la vista, no sobre la tabla base.

Decisión: se usa RLS directamente sobre la tabla (ver `shape.md` para justificación).

## Archivo de migración

```
packages/db/src/migrations/XXXX_roles_postgresql.sql
```

Aplicar con `psql` o mediante `db.execute(sql\`...\`)` en un script de seed/migración manual.
