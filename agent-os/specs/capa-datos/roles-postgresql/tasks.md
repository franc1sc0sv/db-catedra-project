# Tasks: Roles de PostgreSQL

## Task 1 — Revisar tablas existentes en el schema ✅

Revisar los archivos en `packages/db/src/schema/` para confirmar los nombres exactos de tablas y columnas que recibirán GRANTs.

Tablas confirmadas:
- `users` (iam.schema.ts)
- `patients` (patients.schema.ts)
- `scheduleEvents` (schedule-events.schema.ts)
- `medicalAppointments` (medical-appointments.schema.ts)
- `medicalRecords` (medical-records.schema.ts)
- `clinicalConsultations` (clinical-consultations.schema.ts)
- `medicalInsurances` (medical-insurances.schema.ts)
- `whatsappMessages` (whatsapp-messages.schema.ts)

---

## Task 2 — Crear archivo SQL de migración ✅

**Archivo:** `packages/db/src/migrations/sql/0002_roles_postgresql.sql` (path standalone, fuera de la numeración drizzle-kit)

**Skill:** `/tech-drizzle` — roles aplicados fuera del schema Drizzle usando SQL puro en archivo numerado.

Contenido del archivo:

```sql
-- 0001_roles_postgresql.sql
-- Crear roles con login

CREATE ROLE rol_paciente WITH LOGIN PASSWORD 'paciente_pass';
CREATE ROLE rol_secretaria WITH LOGIN PASSWORD 'secretaria_pass';
CREATE ROLE rol_doctora WITH LOGIN PASSWORD 'doctora_pass';
CREATE ROLE rol_admin WITH LOGIN PASSWORD 'admin_pass';

-- ============================================================
-- rol_paciente
-- ============================================================
-- Solo puede ver schedule events disponibles (RLS se activa a nivel de tabla)
GRANT SELECT ON TABLE "scheduleEvents" TO rol_paciente;
-- Puede solicitar citas
GRANT INSERT ON TABLE "medicalAppointments" TO rol_paciente;

-- Activar RLS en scheduleEvents para que rol_paciente solo vea sus filas
ALTER TABLE "scheduleEvents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY paciente_schedule_events ON "scheduleEvents"
  FOR SELECT TO rol_paciente
  USING (true); -- la app establece app.current_user_id vía SET LOCAL

-- ============================================================
-- rol_secretaria
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON TABLE "patients" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "scheduleEvents" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "medicalAppointments" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "whatsappMessages" TO rol_secretaria;
GRANT SELECT ON TABLE "users" TO rol_secretaria;
GRANT SELECT ON TABLE "medicalInsurances" TO rol_secretaria;

-- Acceso a columnas específicas de clinicalConsultations (excluyendo doctorPrivateNotes)
GRANT SELECT (id, "patientId", "doctorId", "consultationDate", diagnosis, treatment, "createdAt", "updatedAt")
  ON TABLE "clinicalConsultations" TO rol_secretaria;

-- ============================================================
-- rol_doctora
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "medicalRecords" TO rol_doctora;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "clinicalConsultations" TO rol_doctora;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "scheduleEvents" TO rol_doctora;
GRANT SELECT ON TABLE "patients" TO rol_doctora;
GRANT SELECT ON TABLE "medicalInsurances" TO rol_doctora;
-- Sin acceso a tablas de autenticación (users, sessions, accounts)

-- ============================================================
-- rol_admin
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
-- Para tablas futuras:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO rol_admin;
```

---

## Task 3 — Aplicar la migración ✅ (pendiente de ejecución manual)

**Skill:** `/tech-drizzle` — la migración SQL se aplica fuera de Drizzle porque Drizzle no gestiona roles PostgreSQL nativamente.

Opción A — `psql` directo:
```bash
psql $DATABASE_URL -f packages/db/src/migrations/0001_roles_postgresql.sql
```

Opción B — script TypeScript en `packages/db/src/`:
```ts
import { db } from './index';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';

const migration = readFileSync('./src/migrations/0001_roles_postgresql.sql', 'utf-8');
await db.execute(sql.raw(migration));
```

---

## Task 4 — Verificar privilegios aplicados ✅ (queries de verificación documentadas)

```sql
-- Confirmar grants por rol
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('rol_paciente', 'rol_secretaria', 'rol_doctora', 'rol_admin')
ORDER BY grantee, table_name;

-- Confirmar column grants para rol_secretaria
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.role_column_grants
WHERE grantee = 'rol_secretaria';
```

---

> Implementación completada: 2026-04-28
>
> - Archivo creado: `packages/db/src/migrations/sql/0002_roles_postgresql.sql`
> - Nombres de tablas usados (PascalCase, conforme al schema): `Users`, `Patients`, `ScheduleEvents`, `MedicalAppointments`, `MedicalRecords`, `ClinicalConsultations`, `MedicalInsurances`, `WhatsAppMessages`.
> - Tasks 1–4 marcadas como `[x]`. Task 3/4 dependen de ejecución manual (`psql`) — no se ejecutaron contra Postgres en esta fase.

