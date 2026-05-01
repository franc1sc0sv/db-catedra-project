# Shape: registro-perfil

## Scope

Registro completo de un paciente nuevo: creación de cuenta vía Better Auth (email + contraseña + verificación de correo) y completado de datos personales (DUI, nombres, fecha de nacimiento, WhatsApp, aseguradora).

**Fuera de scope:**
- Login de pacientes existentes (ya cubierto por la feature `auth`).
- Recuperación de contraseña.
- Edición posterior del perfil.
- Carga de documentos o foto de perfil.

---

## Decisiones

| # | Decisión | Justificación |
|---|---|---|
| 1 | Better Auth maneja todo el paso 1 | Evita reinventar email/password + verificación; el proyecto ya lo tiene configurado. |
| 2 | DUI es la PK de `Patients` | Identidad nacional única en El Salvador; ya definido en el schema existente. |
| 3 | Trigger de DB crea `MedicalRecord` | Garantía de consistencia sin lógica extra en el use case; no puede olvidarse. |
| 4 | `userId` tomado del token de sesión en backend | Nunca confiar en el cliente para proporcionar su propio `userId`. |
| 5 | Lógica de upsert por DUI en el use case, no en el repo | El repo solo expone `findByDui`, `create`, `linkUser`; la lógica de negocio vive en el use case. |
| 6 | Formulario multi-paso en un solo route `/complete-profile` | Evita complejidad de rutas; el estado del paso se maneja localmente con `useState`. |

---

## Contexto

- **MVP entry point**: sin este flujo ningún paciente puede usar el portal.
- El schema `patients` ya existe en `packages/db/src/schema/patients.schema.ts`; verificar que la columna `userId` sea nullable.
- La tabla `medical_insurances` ya existe y se usa para poblar el `<Select>` de aseguradora.
- El proyecto usa **Better Auth** con adaptador Drizzle; el plugin `emailVerification` debe estar activado en `apps/api/src/lib/auth.ts`.

---

## Standards aplicados

| Standard | Archivo de referencia |
|---|---|
| `frontend/entity-schemas` | `standards.md` §1 |
| `frontend/fsd-layer-imports` | `standards.md` §2 |
| `frontend/fsd-public-api` | `standards.md` §3 |
| `frontend/thin-pages` | `standards.md` §4 |
| `backend/use-case-pattern` | `standards.md` §5 |
| `backend/repository-pattern` | `standards.md` §6 |
| `backend/error-handling` | `standards.md` §7 |
| `backend/module-registration` | `standards.md` §8 |
