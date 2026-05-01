# Work Division

## Lead (franc1sc0sv) — Core + Full Calendar Flow

**13 specs · ~68% of MVP work**

Owns the foundation and the entire scheduling system end-to-end: database → auth → booking → calendar views → slot management. All teammate work depends on this shipping first.

### Capa de Datos (5 specs)
| Spec | File |
|---|---|
| Schema corrections | `specs/capa-datos/correcciones-schema.spec.md` |
| Stored procedures | `specs/capa-datos/procedimientos-almacenados.spec.md` |
| Subqueries | `specs/capa-datos/subconsultas.spec.md` |
| PostgreSQL roles | `specs/capa-datos/roles-postgresql.spec.md` |
| Seed data | `specs/capa-datos/datos-semilla.spec.md` |

### Portal del Paciente (4 specs)
| Spec | File |
|---|---|
| Registro y perfil | `specs/portal-paciente/registro-perfil.spec.md` |
| Ver disponibilidad | `specs/portal-paciente/ver-disponibilidad.spec.md` |
| Reservar cita | `specs/portal-paciente/reservar-cita.spec.md` |
| Mis citas | `specs/portal-paciente/mis-citas.spec.md` |

### Calendar Core (4 specs)
| Spec | File |
|---|---|
| Configurar horarios | `specs/vista-doctora/configurar-horarios.spec.md` |
| Agenda hoy (doctora) | `specs/vista-doctora/agenda-hoy.spec.md` |
| Agenda diaria (secretaria) | `specs/panel-secretaria/agenda-diaria.spec.md` |
| Bloquear horarios | `specs/panel-secretaria/bloquear-horarios.spec.md` |

---

## Team Assignments

### P1 — Appointment Lifecycle
**Specs:** `cancelar-reagendar` + `expediente-consulta`

Handles what happens after a slot is booked: cancellations/rescheduling and the clinical record the doctor fills after each visit. Both specs depend on the data layer and calendar being functional.

| Spec | File |
|---|---|
| Cancelar / reagendar | `specs/panel-secretaria/cancelar-reagendar.spec.md` |
| Expediente clínico | `specs/vista-doctora/expediente-consulta.spec.md` |

**Unblocked by:** stored procedures (`sp_cancel_appointment`, `sp_complete_consultation`), `DailyScheduleView`, full calendar flow.

---

### P2 — People Management
**Specs:** `registrar-paciente` + `gestion-usuarios-seguros`

Handles all manual data entry for people: adding walk-in/WhatsApp patients, and managing user accounts and insurance plans. Fully isolated from P1's work.

| Spec | File |
|---|---|
| Registrar paciente (manual) | `specs/panel-secretaria/registrar-paciente.spec.md` |
| Gestión usuarios y seguros | `specs/vista-doctora/gestion-usuarios-seguros.spec.md` |

**Unblocked by:** schema (Patients, Users, MedicalInsurances tables), PostgreSQL roles.

---

### P3 — Google Calendar Integration *(post-MVP)*
**Spec:** `sincronizacion-google`

Adds bidirectional Google Calendar sync to the existing scheduling system. Starts only after the core calendar flow is stable.

| Spec | File |
|---|---|
| Sincronización Google Calendar | `specs/capa-datos/sincronizacion-google.spec.md` |

**Unblocked by:** full calendar flow (configurar-horarios, agenda-hoy, agenda-diaria).

---

### P4 — WhatsApp Integration *(post-MVP)*
**Spec:** `recordatorio-whatsapp`

Adds automated WhatsApp reminders on top of the existing notification stubs. Starts only after the core appointment flow is stable.

| Spec | File |
|---|---|
| Recordatorios WhatsApp | `specs/capa-datos/recordatorio-whatsapp.spec.md` |

**Unblocked by:** `MedicalAppointments`, `WhatsAppMessages` table, `sp_cancel_appointment`.

---

## Sequencing

```
Week 1-2: Lead finishes Capa de Datos
    └── P1, P2 can start in parallel

Week 2-3: Lead finishes Portal del Paciente + Calendar Core
    └── P1 completes cancelar-reagendar + expediente-consulta
    └── P2 completes registrar-paciente + gestion-usuarios-seguros

Post-MVP: P3 (Google Calendar), P4 (WhatsApp) start
```
