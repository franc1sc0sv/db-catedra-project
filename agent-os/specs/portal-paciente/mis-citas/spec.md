# Mis Citas — Spec

## Propósito
Vista de solo lectura del historial de citas del paciente autenticado. Muestra citas próximas y pasadas, con datos clínicos opcionales para las pasadas.

## Estrategia de partición de datos

La lista completa de `MedicalAppointments` del paciente se obtiene filtrando por `patientDui` (extraído de la sesión). Cada cita se une con su `ScheduleEvent` para obtener `eventDate` y `eventTime`. Con esa fecha se aplica la partición:

- **Próximas (`upcoming`)**: `eventDate >= hoy`, ordenadas por fecha ascendente (la más cercana primero).
- **Pasadas (`past`)**: `eventDate < hoy`, ordenadas por fecha descendente (la más reciente primero).

## Join opcional con ClinicalConsultations

Para las citas pasadas, se intenta un left join con `ClinicalConsultations` usando el `appointmentId`. Si la consulta existe, se exponen `mainDiagnosis` y `prescribedTreatment`. Si no existe, esos campos llegan como `null` y la UI los omite silenciosamente — no es un error.

## Paginación

Server Component paginado. Los parámetros de paginación (`page`, `pageSize`) se reciben vía `searchParams`. La sección de próximas se renderiza primero; la sección de pasadas debajo. Cada sección tiene su propio conteo total para que el cliente pueda construir controles de paginación independientes si se requiere en el futuro. Por ahora se usa una paginación única sobre la lista combinada (próximas + pasadas).

## Estado vacío

Si el paciente no tiene citas (ni próximas ni pasadas), se muestra un mensaje amigable en español y un botón CTA que lleva al calendario de disponibilidad (`/ver-disponibilidad`).

## Restricciones
- Solo lectura. Sin acciones de modificación ni cancelación desde esta vista.
- El acceso requiere sesión activa con rol `paciente`.
- Todos los textos en español.
- Componentes de UI exclusivamente de `shadcn/ui` vía `@/components/ui/`.
