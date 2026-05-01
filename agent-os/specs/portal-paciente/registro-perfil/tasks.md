# Tasks: registro-perfil

## T-00 — Guardar documentación ✅

Spec, shape, tasks, standards y references escritos en `agent-os/specs/portal-paciente/registro-perfil/`.

---

## T-01 — Verificar schema de DB ✅

**Skill:** `/tech-drizzle`

- Abrir `packages/db/src/schema/patients.schema.ts`.
- Confirmar que la columna `userId` es nullable (`references(() => users.id).nullable()`).
- Si no lo es, generar migración con `db:push` (dev) o `drizzle-kit generate` (prod).
- Confirmar que existe el trigger `create_medical_record_on_patient_insert` en PostgreSQL o agregarlo como migración SQL manual.

**Archivos:**
- `packages/db/src/schema/patients.schema.ts`
- `packages/db/migrations/` (si se requiere migración)

---

## T-02 — Activar plugin emailVerification en Better Auth ✅

**Skill:** `/better-auth-best-practices`, `/email-and-password-best-practices`

- Abrir `apps/api/src/lib/auth.ts`.
- Agregar `emailVerification({ sendVerificationEmail: async ({ user, url }) => { /* send email */ } })` al array de plugins.
- Configurar `password.minLength: 8` y el patrón de fuerza en `emailAndPassword`.
- Verificar que `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL` estén en `apps/api/.env`.

**Archivos:**
- `apps/api/src/lib/auth.ts`

---

## T-03 — Entidad `patient` en frontend ✅

**Skill:** `/frontend-architecture`, `/tech-drizzle`

Crear esquema Zod y tipos inferidos para el formulario de perfil.

**Archivos:**
- `apps/web/src/entities/patient/model/schemas.ts` — `completeProfileSchema` + `CompleteProfileValues`
- `apps/web/src/entities/patient/model/types.ts` — tipo `Patient` (shape de respuesta API)
- `apps/web/src/entities/patient/index.ts` — reexportar todo desde `./model/schemas` y `./model/types`

**Schema mínimo:**
```ts
export const completeProfileSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  dui: z.string().length(9, 'DUI debe tener exactamente 9 caracteres'),
  birthDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Fecha inválida'),
  whatsapp: z.string().min(8, 'WhatsApp requerido'),
  insuranceId: z.string().uuid().optional(),
})
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>
```

---

## T-04 — Feature `patient-registration`: formulario CompleteProfileForm ✅

**Skill:** `/frontend-design`, `/tailwind-css-patterns`, `/better-auth-best-practices`

- `apps/web/src/features/patient-registration/ui/CompleteProfileForm.tsx`
  - `'use client'`
  - `react-hook-form` + `zodResolver(completeProfileSchema)`
  - Indicador de progreso (Step 1 / Step 2) usando clases Tailwind (`bg-primary rounded-full`).
  - Campos: `firstName`, `lastName`, `dui` (maxLength=9), `birthDate` (`<Input type="date">`), `whatsapp`, `insuranceId` (`<Select>`).
  - Poblar `<Select>` con insurances obtenidas desde la API pública (fetch en el Server Component padre).
  - Al submit: llamar `POST /api/patients/complete-profile` vía Eden Treaty client (`clientApi`).
  - Manejo de errores inline con `<Alert variant="destructive">` en español.
  - Todos los componentes de `@/components/ui/` (Button, Input, Label, Card, Select, Alert).
- `apps/web/src/features/patient-registration/index.ts` — reexportar `CompleteProfileForm`.

---

## T-05 — View `complete-profile` y thin page ✅

**Skill:** `/frontend-architecture`, `/next-best-practices`

- `apps/web/src/views/complete-profile/ui/CompleteProfilePage.tsx`
  - Server Component.
  - Llama a la API para obtener la lista de aseguradoras (`api.insurances.list.get()`).
  - Renderiza `<CompleteProfileForm insurances={insurances} />` dentro de un `<Card>`.
  - Si el usuario ya tiene `Patient` vinculado (`session.user.patientId`), `redirect('/dashboard')`.
- `apps/web/src/views/complete-profile/index.ts` — reexportar `CompleteProfilePage`.
- `apps/web/src/app/(auth)/complete-profile/page.tsx` — thin page:
  ```tsx
  import { CompleteProfilePage } from '@/views/complete-profile'
  export default async function CompleteProfileRoute() {
    return <CompleteProfilePage />
  }
  ```

---

## T-06 — Pantalla de advertencia: correo sin verificar ✅

**Skill:** `/frontend-design`, `/better-auth-best-practices`

- Si `session.user.emailVerified === false`, mostrar página en `/verify-email` con:
  - Mensaje en español: *"Verifica tu correo para continuar"*.
  - Botón "Reenviar correo" que llama a Better Auth `sendVerificationEmail`.
  - Componentes: `<Card>`, `<Alert>`, `<Button>` de `@/components/ui/`.
- Archivos:
  - `apps/web/src/app/(auth)/verify-email/page.tsx`
  - `apps/web/src/views/verify-email/ui/VerifyEmailPage.tsx`
  - `apps/web/src/views/verify-email/index.ts`

---

## T-07 — Backend: entidad, DTO, repositorio ✅

**Skill:** `/backend-architecture`, `/tech-drizzle`

**Entidad:**
- `apps/api/src/modules/patients/domain/entities/patient.entity.ts`
  - Clase `Patient` con propiedades: `dui`, `firstName`, `lastName`, `birthDate`, `whatsapp`, `userId`, `insuranceId`.

**DTO de entrada:**
- `apps/api/src/modules/patients/application/dtos/inputs/complete-profile.input.ts`
  - Interfaz `CompleteProfileInput` con los mismos campos que el schema Zod frontend.

**DTO de salida:**
- `apps/api/src/modules/patients/application/dtos/outputs/patient.output.ts`
  - Interfaz `PatientOutput` (subset seguro de `Patient`, sin datos sensibles).

**Interfaz de repositorio (abstract class):**
- `apps/api/src/modules/patients/domain/interfaces/patients.repository.ts`
  ```ts
  export abstract class PatientsRepository {
    abstract findByDui(dui: string): Promise<Patient | null>
    abstract create(data: CompleteProfileInput, userId: string): Promise<Patient>
    abstract linkUser(dui: string, userId: string): Promise<Patient>
  }
  ```

**Implementación Drizzle:**
- `apps/api/src/modules/patients/infrastructure/repositories/drizzle-patients.repository.ts`
  - `@injectable()`, extiende / implementa `PatientsRepository`.
  - `toEntity(row: typeof patients.$inferSelect): Patient`.
  - Usa `db.insert(patients)`, `db.update(patients)`, `db.query.patients.findFirst`.

---

## T-08 — Backend: use case `CompleteProfileUseCase` ✅

**Skill:** `/backend-architecture`

- `apps/api/src/modules/patients/application/usecases/complete-profile.usecase.ts`
- `@injectable()`, `extends BaseUseCase<CompleteProfileInput & { userId: string }, PatientOutput>`.
- Lógica en `handle()`:
  1. `repo.findByDui(input.dui)`
  2. Si no existe → `repo.create(input, userId)`
  3. Si existe y `userId === null` → `repo.linkUser(dui, userId)`
  4. Si existe y `userId !== null` y diferente → `throw new AppError('Ese DUI ya está asociado a otra cuenta', 409)`
  5. Mapear a `PatientOutput` y retornar.
- `execute()` envuelve `handle()` en `db.transaction()`.

---

## T-09 — Backend: ruta `patients.routes.ts` ✅

**Skill:** `/tech-elysia`, `/backend-architecture`

- `apps/api/src/modules/patients/presentation/patients.routes.ts`
- `createRouter()` con plugin `betterAuthPlugin` para proteger las rutas.
- `POST /patients/complete-profile`:
  - Body validado con el schema Elysia (mismo shape que `CompleteProfileInput`).
  - Extrae `userId` de `context.user.id` (inyectado por `betterAuthPlugin`).
  - Llama `completeProfileUseCase.execute({ ...body, userId })`.
  - Retorna `201` con `PatientOutput`.
- Manejo de errores delegado al handler global de `app.ts`.

---

## T-10 — Backend: módulo y registro IoC ✅

**Skill:** `/backend-architecture`

- `apps/api/src/modules/patients/patients.module.ts`
  - `AppModule` que en `load()` vincula:
    - `PatientsRepository` → `DrizzlePatientsRepository` (singleton)
    - `CompleteProfileUseCase` (transient)

- Registrar en:
  - `apps/api/src/common/ioc/bootstrap.ts` → importar y cargar `PatientsModule`.
  - `apps/api/src/app.ts` → registrar el router `patientsRouter` bajo el prefijo `/patients`.

---

## T-11 — Prueba de integración manual (checklist)

- [ ] `POST /auth/sign-up` crea usuario + envía email.
- [ ] Acceder a `/complete-profile` sin verificar correo redirige a `/verify-email`.
- [ ] Reenvío de correo funciona desde `/verify-email`.
- [ ] `POST /patients/complete-profile` con DUI nuevo → 201 + `MedicalRecord` creado.
- [ ] Mismo endpoint con DUI existente y `userId=NULL` → 200 + paciente vinculado.
- [ ] Mismo endpoint con DUI existente y `userId≠NULL` → 409 con mensaje en español.
- [ ] Formulario muestra errores inline en español.
- [ ] Tras guardar perfil, usuario es redirigido a `/dashboard`.

> Implementación completada: 2026-04-28
