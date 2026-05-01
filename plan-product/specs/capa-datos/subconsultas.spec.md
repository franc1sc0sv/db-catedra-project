# Subconsultas

## ¿Qué hace esta parte del sistema?

Esta parte documenta tres subconsultas SQL standalone que demuestran el uso de esta técnica con propósitos y formas distintas. Las vistas existentes ya usan subconsultas internamente — en particular, `PatientFullRecordView` usa una `LATERAL` subquery para obtener la última consulta clínica — pero el rubric requiere evidencia explícita de subconsultas con distintas técnicas: correlacionada en `WHERE`, tabla derivada en `FROM`, y `NOT EXISTS`.

Las tres subconsultas tienen utilidad real en el sistema y no son ejemplos artificiales. Pueden ejecutarse directamente contra la base de datos para análisis operativo o integrarse en queries de la API cuando el query builder de Drizzle no alcanza para expresar la lógica.

## ¿Quién la usa?

El desarrollador que implementa queries de análisis en la API, y el evaluador académico que verifica el uso de subconsultas como técnica.

## ¿Cómo funciona?

La primera subconsulta identifica pacientes frecuentes usando una subconsulta correlacionada en el `WHERE`. Para cada fila de `Patients`, la subconsulta interna cuenta cuántas veces aparece ese DUI en `MedicalAppointments`; si el conteo es mayor que uno, el paciente se incluye en el resultado. Esta es una subconsulta correlacionada porque referencia `p.dui` de la query externa en su cláusula `WHERE` interna, lo que significa que se ejecuta una vez por cada fila de `Patients`. El resultado devuelve `dui`, `firstName`, `lastName` y el conteo de citas, útil para que la secretaria identifique pacientes que merecen seguimiento prioritario.

La segunda subconsulta calcula la disponibilidad semanal usando una tabla derivada en el `FROM`. La subconsulta interna filtra los `ScheduleEvents` con `availabilityStatus = 'available'` y `eventDate` entre hoy y hoy más siete días; la query externa agrupa ese resultado por `eventDate` y cuenta cuántos slots hay en cada fecha. Esto permite mostrar en el portal del paciente un resumen visual de qué días de la semana tienen horarios disponibles sin necesidad de cargar todos los eventos individuales. La tabla derivada recibe un alias y se trata como si fuera una tabla real en la query exterior.

La tercera subconsulta detecta citas sin registro clínico usando `NOT EXISTS`. La query principal selecciona de `MedicalAppointments` todos los registros cuyo `id` no aparece como `appointmentId` en ninguna fila de `ClinicalConsultations`. Esto identifica citas que, según el sistema, deberían haber tenido una consulta registrada pero no la tienen — por ejemplo, citas marcadas como `completed` en el `ScheduleEvent` pero sin datos clínicos asociados. El uso de `NOT EXISTS` es más eficiente que un `LEFT JOIN ... WHERE IS NULL` cuando la tabla de `ClinicalConsultations` es grande, porque el motor puede hacer short-circuit en cuanto encuentra la primera fila coincidente.

## Skills relevantes

- `/tech-drizzle` — las subconsultas se expresan con el template literal `sql\`...\`` de Drizzle cuando el query builder relacional (`db.query`) no puede expresar la lógica; el resultado se tipea manualmente con una interfaz TypeScript
