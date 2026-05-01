# References: Roles de PostgreSQL

## Schema files — packages/db/src/schema/

### iam.schema.ts
Tabla `users` con columna `role` (enum). Los roles PostgreSQL se asignan a conexiones de BD independientemente de esta columna, pero el valor del enum es la fuente de verdad para la lógica de autorización en la aplicación.

Ruta: `packages/db/src/schema/iam.schema.ts`

### patients.schema.ts
Tabla `patients`. `rol_secretaria` y `rol_doctora` tienen acceso de lectura; `rol_secretaria` además puede insertar y actualizar.

Ruta: `packages/db/src/schema/patients.schema.ts`

### schedule-events.schema.ts
Tabla `scheduleEvents`. Es la única tabla donde se activa RLS para `rol_paciente`. `rol_doctora` y `rol_secretaria` tienen CRUD / SELECT+INSERT+UPDATE respectivamente.

Ruta: `packages/db/src/schema/schedule-events.schema.ts`

### medical-appointments.schema.ts
Tabla `medicalAppointments`. `rol_paciente` puede insertar (solicitar cita). `rol_secretaria` tiene SELECT/INSERT/UPDATE.

Ruta: `packages/db/src/schema/medical-appointments.schema.ts`

### medical-records.schema.ts
Tabla `medicalRecords`. Solo `rol_doctora` tiene CRUD completo. Ningún otro rol tiene acceso.

Ruta: `packages/db/src/schema/medical-records.schema.ts`

### clinical-consultations.schema.ts
Tabla `clinicalConsultations` con columna sensible `doctorPrivateNotes`. `rol_doctora` tiene CRUD completo incluyendo esa columna. `rol_secretaria` tiene SELECT solo sobre columnas no sensibles (column-level grant). `rol_paciente` sin acceso.

Ruta: `packages/db/src/schema/clinical-consultations.schema.ts`

### medical-insurances.schema.ts
Tabla `medicalInsurances`. `rol_secretaria` y `rol_doctora` tienen SELECT. Sin acceso de escritura desde estos roles.

Ruta: `packages/db/src/schema/medical-insurances.schema.ts`

### whatsapp-messages.schema.ts
Tabla `whatsappMessages`. Solo `rol_secretaria` tiene SELECT/INSERT/UPDATE.

Ruta: `packages/db/src/schema/whatsapp-messages.schema.ts`

### index.ts
Barrel de exports del schema. Referencia para confirmar nombres de tablas exportados.

Ruta: `packages/db/src/schema/index.ts`

## Migration destination

```
packages/db/src/migrations/0001_roles_postgresql.sql
```

Archivo SQL numerado, no generado por Drizzle. Debe aplicarse manualmente vía `psql` o `db.execute(sql.raw(...))`.
