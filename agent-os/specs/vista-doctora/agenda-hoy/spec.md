# Agenda de Hoy — Spec

## Descripción general

Pantalla principal de la doctora. Muestra todos los slots del día actual (o del día indicado por parámetro URL) ordenados por hora de inicio. La información proviene de `DailyScheduleView`, una vista Drizzle que combina horarios, reservas y consultas clínicas.

## Fuente de datos: DailyScheduleView

La vista `DailyScheduleView` centraliza los datos necesarios para la jornada:

- `slotId`, `startTime`, `endTime`
- `patientId`, `patientName` (null si cupo libre)
- `bookingReason` (null si cupo libre)
- `status` — valores posibles: `disponible`, `reservado`, `completado`, `cancelado`
- `mainDiagnosis` — proviene de `ClinicalConsultations`, presente solo cuando `status = completado`

La query filtra por fecha (`DATE(startTime) = :fecha`) y ordena por `startTime ASC`. Solo se seleccionan las columnas necesarias (regla `/tech-drizzle` `rqb-select-columns`).

## Parámetro de fecha

La fecha se lee del query param `?fecha=YYYY-MM-DD`. Si el parámetro está ausente, se usa la fecha actual del servidor. El valor se parsea en el Server Component de la página (`page.tsx`) y se pasa como prop al view component `AgendaDoctorPage`.

El diseño URL-first hace la URL compartible y recargable sin pérdida de estado.

## Navegación de fechas

La UI muestra controles `← Anterior` / `Siguiente →` que modifican el param `fecha` en la URL mediante `<Link>` de Next.js. No se usa estado del cliente para la fecha activa.

## Visualización de slots

Cada fila del timeline muestra:

| Campo | Slot libre | Slot reservado | Consulta completada |
|-------|-----------|---------------|-------------------|
| Hora | `HH:MM – HH:MM` | `HH:MM – HH:MM` | `HH:MM – HH:MM` |
| Paciente | — "Cupo disponible" | Nombre del paciente | Nombre del paciente |
| Motivo | — | `bookingReason` | `bookingReason` |
| Estado | Badge gris | Badge azul | Badge verde |
| Diagnóstico | — | — | `mainDiagnosis` inline |
| Acción | — | Botón "Ver historial" (navegación futura) | Botón "Ver historial" (navegación futura) |

Los slots libres **no se ocultan** — la doctora necesita ver su tiempo disponible.

## Revalidación periódica

El Server Component usa `fetch` con `next: { revalidate: 30 }` (o equivalente con `revalidate = 30` en el segmento) para que si un paciente reserva mientras la pantalla está abierta, el cambio aparezca sin recarga manual en un máximo de 30 segundos.

No se usa polling desde el cliente ni WebSockets en este MVP.

## Autenticación y autorización

El guard de servidor (`guards.server.ts`) verifica que el usuario autenticado tenga rol `doctora` antes de renderizar. Si no está autenticado, redirige a `/login`. Si tiene otro rol, redirige a su dashboard correspondiente.

## Endpoint de API

`GET /agenda?fecha=YYYY-MM-DD`

- Requiere sesión con rol `doctora` (verificado en middleware Elysia del módulo).
- Devuelve `AgendaItemOutput[]` ordenados por `startTime`.
- Si `fecha` no es un string válido `YYYY-MM-DD`, responde `400`.
