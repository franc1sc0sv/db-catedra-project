# Tasks — Subconsultas

> Implementación completada: 2026-04-28

## Task 1 — Guardar documentación [x]

Spec, shape, standards y references creados en `agent-os/specs/capa-datos/subconsultas/`.

---

## Task 2 — Crear archivo de subconsultas standalone [x]

**Archivo:** `packages/db/src/queries/subqueries.ts`

**Acción:** Crear el archivo con las tres funciones exportadas usando `sql` template literal de Drizzle.

**Skill:** `/tech-drizzle` — ver regla `qb-use-for-aggregations` y uso de `sql` para raw queries.

**Criterios de aceptación:**
- Archivo exporta `getFrequentPatients()`, `getWeeklyAvailability()`, `getAppointmentsWithoutClinicalRecord()`
- Cada función recibe `db: TxClient` como parámetro
- Resultados tipados con interfaces TypeScript explícitas
- Compilación sin errores TypeScript

---

## Task 3 — Implementar `getFrequentPatients` (subconsulta correlacionada en WHERE) [x]

**Archivo:** `packages/db/src/queries/subqueries.ts`

**Acción:** Implementar la función usando subconsulta correlacionada que cuenta citas por paciente.

**Skill:** `/tech-drizzle` — `sql\`...\`` template literal, `db.execute()`.

**SQL a implementar:**
```sql
SELECT
  p.dui,
  p.first_name AS "firstName",
  p.last_name AS "lastName",
  (
    SELECT COUNT(*)
    FROM medical_appointments ma
    WHERE ma.patient_dui = p.dui
  )::int AS "appointmentCount"
FROM patients p
WHERE (
  SELECT COUNT(*)
  FROM medical_appointments ma
  WHERE ma.patient_dui = p.dui
) > 1
ORDER BY "appointmentCount" DESC
```

**Interfaz de retorno:**
```typescript
interface FrequentPatient {
  dui: string;
  firstName: string;
  lastName: string;
  appointmentCount: number;
}
```

---

## Task 4 — Implementar `getWeeklyAvailability` (tabla derivada en FROM) [x]

**Archivo:** `packages/db/src/queries/subqueries.ts`

**Acción:** Implementar la función con tabla derivada en FROM que agrupa slots disponibles por día.

**Skill:** `/tech-drizzle` — `sql\`...\`` template literal, `db.execute()`.

**SQL a implementar:**
```sql
SELECT
  available_days."eventDate",
  COUNT(*) AS "availableSlots"
FROM (
  SELECT event_date AS "eventDate"
  FROM schedule_events
  WHERE availability_status = 'available'
    AND event_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
) AS available_days
GROUP BY available_days."eventDate"
ORDER BY available_days."eventDate"
```

**Interfaz de retorno:**
```typescript
interface DailyAvailability {
  eventDate: string;
  availableSlots: number;
}
```

---

## Task 5 — Implementar `findAppointmentsWithoutConsultation` (NOT EXISTS) [x]

**Archivo:** `packages/db/src/queries/subqueries.ts`

**Acción:** Implementar la función con NOT EXISTS para detectar citas sin consulta clínica registrada.

**Skill:** `/tech-drizzle` — `sql\`...\`` template literal, `db.execute()`.

**SQL a implementar:**
```sql
SELECT
  ma.id,
  ma.patient_dui AS "patientDui",
  ma.doctor_id AS "doctorId",
  ma.appointment_date AS "appointmentDate",
  ma.status
FROM medical_appointments ma
WHERE NOT EXISTS (
  SELECT 1
  FROM clinical_consultations cc
  WHERE cc.appointment_id = ma.id
)
ORDER BY ma.appointment_date DESC
```

**Interfaz de retorno:**
```typescript
interface AppointmentWithoutRecord {
  id: string;
  patientDui: string;
  doctorId: string;
  appointmentDate: string;
  status: string;
}
```

---

## Task 6 — Verificar nombres de columnas contra schema real [x]

**Archivos a consultar:** `packages/db/src/schema/`

**Acción:** Confirmar que los nombres de columnas en el SQL generado (snake_case) coinciden con los nombres reales en el schema de Drizzle. Ajustar si hay discrepancias.

**Skill:** `/tech-drizzle` — `schema-infer-types`, `schema-one-table-per-file`.

**Criterios de aceptación:**
- Todas las referencias a columnas existen en el schema
- Los `AS` aliases mapean correctamente a las interfaces TypeScript
