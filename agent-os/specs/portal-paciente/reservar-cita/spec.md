# Spec: Reservar Cita

## Resumen
Paso final del flujo de reserva. El paciente autenticado, con un slot preseleccionado del calendario, confirma el horario, ingresa el motivo de consulta, y el sistema registra la cita de forma atómica. Al terminar: confirmación en pantalla y mensaje de WhatsApp al paciente.

---

## Flujo principal

1. El paciente llega a `/reservar/[eventId]` con un `eventId` proveniente del calendario de disponibilidad.
2. La página muestra un resumen del slot: fecha, hora de inicio y hora de fin.
3. El paciente escribe el motivo de consulta en un textarea y presiona "Confirmar cita".
4. El frontend llama `POST /appointments` con `{ eventId, bookingReason }`.
5. El backend ejecuta la cadena de tres pasos en el siguiente orden:
   - **Validación previa**: consultar `ScheduleEvent` y verificar que `availabilityStatus === 'available'`. Si no, lanzar `AppError` con código `SLOT_UNAVAILABLE`.
   - **INSERT** en `MedicalAppointments` con `(eventId, patientDui, bookingReason)`. El campo `eventId` tiene un constraint `UNIQUE`, por lo que un doble-booking falla con violación de constraint único.
   - **Trigger 1**: actualizar `ScheduleEvent.availabilityStatus → 'busy'`.
   - **Trigger 2**: insertar un registro en `WhatsAppMessage` con `type = 'confirmation'`.
6. El frontend muestra la pantalla de éxito con un resumen de la cita confirmada.

---

## Cadena de triggers

```
POST /appointments
  └─ BookAppointmentUseCase.handle()
       ├─ validateSlotAvailable(eventId)        → lanza SLOT_UNAVAILABLE si no está 'available'
       ├─ INSERT MedicalAppointments            → lanza SLOT_TAKEN si unique constraint falla
       ├─ UPDATE ScheduleEvent availabilityStatus → 'busy'
       └─ INSERT WhatsAppMessage type='confirmation'
```

Los tres pasos de escritura deben ejecutarse dentro de una transacción Drizzle (`db.transaction()`). Si cualquier paso falla, los anteriores se revierten.

---

## Manejo de condiciones de error

### Race condition — doble booking
- **Causa**: dos pacientes ven el mismo slot simultáneamente y ambos confirman.
- **Mecanismo**: el constraint `UNIQUE` en `MedicalAppointments.eventId` hace que el segundo INSERT falle con un error de base de datos.
- **Manejo**: el repositorio convierte la violación de constraint único en `AppError(SLOT_TAKEN)`. El global error handler en Elysia traduce esto a HTTP 409 con mensaje en español.
- **UI**: el frontend muestra "Ese cupo ya no está disponible, elige otro horario" y ofrece un botón para volver al calendario.

### Perfil incompleto
- **Causa**: el paciente está autenticado pero no tiene un registro en la tabla `Patients` con todos los campos requeridos.
- **Mecanismo**: el use case busca el perfil del paciente antes del INSERT. Si no existe o está incompleto, lanza `AppError(PROFILE_INCOMPLETE)`.
- **UI**: el frontend redirige a `/completar-perfil`.

### Slot ya no disponible (validación previa)
- **Causa**: el slot pasó a `'busy'` entre que el paciente lo vio y cuando confirma (sin llegar a race condition de INSERT).
- **Mecanismo**: validación explícita antes del INSERT.
- **UI**: mismo mensaje que race condition — "Ese cupo ya no está disponible".

---

## Actores y precondiciones

| Actor | Precondición |
|---|---|
| Paciente autenticado | Sesión válida via Better Auth |
| Slot preseleccionado | `eventId` válido en URL, `availabilityStatus === 'available'` |
| Perfil completo | Registro en `Patients` con `dui` y campos requeridos |

---

## Postcondiciones (éxito)

- Existe un registro en `MedicalAppointments` con el `eventId`.
- `ScheduleEvent.availabilityStatus` es `'busy'`.
- Existe un registro en `WhatsAppMessage` con `type = 'confirmation'` vinculado al paciente.
- El paciente ve la pantalla de confirmación en la UI.
