# Spec — Subconsultas

## Propósito

Documentar e implementar tres subconsultas SQL standalone que demuestran técnicas distintas requeridas por el rubric académico. Las subconsultas tienen utilidad real en el sistema y pueden ejecutarse directamente o integrarse en queries de la API cuando el query builder de Drizzle no alcanza.

---

## Subconsulta 1 — Correlacionada en WHERE (pacientes frecuentes)

**Técnica:** Subconsulta correlacionada — la subquery referencia una columna de la query externa en cada fila evaluada.

**Propósito de negocio:** Identificar pacientes que han tenido más de una cita médica, útil para programas de seguimiento y análisis de recurrencia.

**Lógica:**
Para cada fila de `Patients`, la subconsulta cuenta cuántas filas existen en `MedicalAppointments` donde `patientDui` coincide con el `dui` de la fila externa. Si el conteo es mayor a 1, el paciente se incluye en el resultado.

**Columnas retornadas:** `dui`, `firstName`, `lastName`, `appointmentCount`

**Integración en la API:** Puede usarse en un endpoint de análisis o reporte de pacientes recurrentes dentro del módulo de pacientes.

---

## Subconsulta 2 — Tabla derivada en FROM (disponibilidad semanal)

**Técnica:** Tabla derivada (derived table) — una subquery en la cláusula FROM actúa como tabla virtual sobre la que la query externa opera.

**Propósito de negocio:** Mostrar cuántos slots de disponibilidad hay por día durante los próximos 7 días, para dashboards de agenda.

**Lógica:**
- Subquery interna: filtra `ScheduleEvents` donde `availabilityStatus = 'available'` y `eventDate` está entre hoy y hoy+7 días.
- Query externa: agrupa por `eventDate` y cuenta los slots disponibles (`COUNT(*) AS availableSlots`).

**Columnas retornadas:** `eventDate`, `availableSlots`

**Integración en la API:** Endpoint de disponibilidad semanal en el módulo de agenda o doctores.

---

## Subconsulta 3 — NOT EXISTS (citas sin registro clínico)

**Técnica:** `NOT EXISTS` — la subquery verifica ausencia de filas relacionadas; más eficiente que `LEFT JOIN ... WHERE IS NULL` en tablas grandes por evaluación en cortocircuito.

**Propósito de negocio:** Detectar brechas de integridad de datos: citas médicas que nunca generaron una consulta clínica registrada.

**Lógica:**
Selecciona filas de `MedicalAppointments` para las que no existe ninguna fila en `ClinicalConsultations` con el mismo `appointmentId`.

**Columnas retornadas:** `id`, `patientDui`, `doctorId`, `appointmentDate`, `status`

**Integración en la API:** Endpoint de auditoría o tarea de mantenimiento de datos en el módulo de consultas clínicas.

---

## Implementación técnica

Todas las subconsultas se expresan con el template literal `sql\`...\`` de Drizzle ORM y se ejecutan con `db.execute(sql\`...\`)`. Los resultados se tipan manualmente con interfaces TypeScript (`$inferSelect` no aplica para queries raw).

**Archivo de implementación:** `packages/db/src/queries/subqueries.ts`

Cada subconsulta se exporta como función async tipada para facilitar su uso en repositorios o casos de uso de la API.
