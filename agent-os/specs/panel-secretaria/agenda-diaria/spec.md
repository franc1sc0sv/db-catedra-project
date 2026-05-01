# Spec: Agenda Diaria (Secretaria)

## Propósito
Primera pantalla operativa de la secretaria. Muestra todos los slots del día en orden cronológico: franja horaria, estado, nombre del paciente, motivo de reserva y teléfono WhatsApp. Es el punto de entrada para cancelar turnos existentes y crear turnos manuales.

---

## Fuente de datos: DailyScheduleView

La pantalla consume `DailyScheduleView`, una vista Drizzle que consolida slots de agenda con sus reservas asociadas. La query filtra por fecha (parámetro `fecha=YYYY-MM-DD`, por defecto hoy) y ordena por `startTime` ascendente.

Campos relevantes por fila:
- `startTime` / `endTime` — franja horaria
- `availabilityStatus` — `available | busy | blocked | completed | cancelled`
- `patientName` — nombre del paciente (null si el slot está libre)
- `bookingReason` — motivo de la reserva (null si libre)
- `whatsappPhone` — teléfono del paciente (null si libre)
- `appointmentId` — id del turno activo (null si sin reserva)
- `slotId` — id del slot de agenda

El endpoint del API es `GET /agenda?fecha=YYYY-MM-DD` autenticado con rol `receptionist` o `admin`. La capa de aplicación expone `GetDailyAgendaReceptionistUseCase` que mapea la vista al DTO `ReceptionistAgendaItemOutput`.

---

## Estrategia de color por estado

| availabilityStatus | Color Tailwind | Descripción visual |
|--------------------|----------------|--------------------|
| `available`        | neutral (gris claro) | Slot libre, sin paciente |
| `busy`             | azul (`bg-blue-50 border-blue-300`) | Turno activo con paciente |
| `blocked`          | amarillo/naranja (`bg-amber-50 border-amber-300`) | Slot bloqueado por la secretaria |
| `completed`        | verde (`bg-green-50 border-green-300`) | Turno atendido |
| `cancelled`        | rojo (`bg-red-50 border-red-300`) | Turno cancelado |

El color se aplica a la fila completa de la tabla (`<tr>` o div-row) para lectura rápida.

---

## Distinción crítica: sin agenda vs agenda vacía

- **Día sin slots configurados**: la API devuelve array vacío porque no existen filas en `DailyScheduleView` para esa fecha. La UI muestra el mensaje "No hay agenda configurada para esta fecha." (no una tabla vacía).
- **Día con slots pero sin reservas**: la API devuelve filas con `availabilityStatus = available` y campos de paciente en null. La UI muestra la tabla completa con todas las franjas en color neutral.

La distinción se hace en el frontend verificando si el array tiene longitud 0.

---

## Navegación de fecha

- URL contiene `?fecha=YYYY-MM-DD`. Si ausente, se usa la fecha de hoy del servidor.
- La UI ofrece botones "día anterior" / "día siguiente" y un date picker.
- Cambiar la fecha actualiza el searchParam → re-fetch en RSC (no client-side state).

---

## Puntos de entrada a acciones

Desde cada fila la secretaria puede:

1. **Slot con turno activo (`busy`)** → botón "Cancelar" inicia el flujo de cancelación (spec separado).
2. **Slot disponible (`available`)** → botón "Reservar" abre el formulario de creación de turno manual para paciente registrado (spec separado).
3. Filas `blocked`, `completed` y `cancelled` no tienen acción primaria en esta pantalla.

Las acciones se implementan como Client Components que reciben `slotId` / `appointmentId` por props.
