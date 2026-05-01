# Standards: registro-perfil

## §1 — frontend/entity-schemas

Zod schemas e inferred types en `entities/[name]/model/schemas.ts`. Las features consumen únicamente desde la public API del entity (`index.ts`).

```ts
// entities/patient/model/schemas.ts
import { z } from 'zod'

export const completeProfileSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName:  z.string().min(1, 'Requerido'),
  dui:       z.string().length(9, 'DUI debe tener exactamente 9 caracteres'),
  birthDate: z.string().refine(v => !isNaN(Date.parse(v)), 'Fecha inválida'),
  whatsapp:  z.string().min(8, 'WhatsApp requerido'),
  insuranceId: z.string().uuid().optional(),
})

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>
```

**Regla:** nunca duplicar la definición de campos entre frontend y backend; el schema Zod es la fuente de verdad para el cliente. El backend valida de forma independiente con su propio input DTO.

---

## §2 — frontend/fsd-layer-imports

Orden de importación estricto (de mayor a menor nivel de abstracción):

```
app → views → widgets → features → entities → shared
```

- Un slice dentro de una capa **no puede importar** a otro slice de la misma capa.
- Este proyecto usa `src/views/` en lugar de `src/pages/` para evitar conflicto con el Pages Router de Next.js.

**Correcto:**
```ts
// features/patient-registration/ui/CompleteProfileForm.tsx
import { completeProfileSchema } from '@/entities/patient'
import { Button } from '@/components/ui/button'
```

**Incorrecto:**
```ts
// features/patient-registration — importar desde otra feature
import { useAuth } from '@/features/auth'  // ❌
```

---

## §3 — frontend/fsd-public-api

Cada slice debe exponer un único punto de entrada: `index.ts`.

```ts
// entities/patient/index.ts
export { completeProfileSchema } from './model/schemas'
export type { CompleteProfileValues, Patient } from './model/types'
```

```ts
// features/patient-registration/index.ts
export { CompleteProfileForm } from './ui/CompleteProfileForm'
```

```ts
// views/complete-profile/index.ts
export { CompleteProfilePage } from './ui/CompleteProfilePage'
```

**Regla:** jamás importar desde rutas internas (`@/features/patient-registration/ui/CompleteProfileForm`); siempre desde el barrel (`@/features/patient-registration`).

---

## §4 — frontend/thin-pages

`page.tsx` solo parsea params/searchParams y renderiza exactamente **un** componente de view. Sin lógica de negocio, sin data fetching, sin JSX adicional.

```tsx
// apps/web/src/app/(auth)/complete-profile/page.tsx
import { CompleteProfilePage } from '@/views/complete-profile'

export default async function CompleteProfileRoute() {
  return <CompleteProfilePage />
}
```

La lógica de redirección (ej. `redirect('/dashboard')` si ya tiene perfil) va en el Server Component de view, no en `page.tsx`.

---

## §5 — backend/use-case-pattern

```ts
@injectable()
export class CompleteProfileUseCase extends BaseUseCase<
  CompleteProfileInput & { userId: string },
  PatientOutput
> {
  constructor(
    @inject(PatientsRepository) private repo: PatientsRepository,
  ) { super() }

  protected async handle(input: CompleteProfileInput & { userId: string }): Promise<PatientOutput> {
    // lógica de negocio aquí
    // throw new AppError('mensaje', statusCode) para errores
  }

  async execute(input: CompleteProfileInput & { userId: string }): Promise<PatientOutput> {
    return db.transaction(() => this.handle(input))
  }
}
```

**Reglas:**
- `@injectable()` siempre.
- `handle()` contiene la lógica; `execute()` envuelve en transacción.
- `AppError` para todos los errores de negocio; nunca `try/catch` en el use case.

---

## §6 — backend/repository-pattern

```ts
// domain/interfaces/patients.repository.ts
export abstract class PatientsRepository {
  abstract findByDui(dui: string): Promise<Patient | null>
  abstract create(data: CompleteProfileInput, userId: string): Promise<Patient>
  abstract linkUser(dui: string, userId: string): Promise<Patient>
}

// infrastructure/repositories/drizzle-patients.repository.ts
@injectable()
export class DrizzlePatientsRepository implements PatientsRepository {
  private toEntity(row: typeof patients.$inferSelect): Patient { /* mapper */ }

  async findByDui(dui: string): Promise<Patient | null> {
    const row = await db.query.patients.findFirst({ where: eq(patients.dui, dui) })
    return row ? this.toEntity(row) : null
  }
  // ...
}
```

**Reglas:**
- La clase abstracta actúa como token de Inversify.
- `toEntity()` mapper privado; retorna siempre la entidad de dominio.
- Último parámetro opcional `tx?: TxClient` para operaciones dentro de transacciones.

---

## §7 — backend/error-handling

```ts
// Correcto
throw new AppError('Ese DUI ya está asociado a otra cuenta', 409)

// Incorrecto
try {
  await repo.create(...)
} catch (e) {
  return { error: e.message }  // ❌ nunca capturar en routes/use cases
}
```

**Reglas:**
- `AppError(message, statusCode)` es el único mecanismo de error de negocio.
- El handler global en `app.ts` captura todos los `AppError` y retorna la respuesta HTTP.
- Nunca `try/catch` en routes ni en use cases; solo en la implementación del repositorio para errores de DB que se deben transformar.

---

## §8 — backend/module-registration

```ts
// patients.module.ts
export class PatientsModule extends AppModule {
  load(container: Container): void {
    container.bind(PatientsRepository).to(DrizzlePatientsRepository).inSingletonScope()
    container.bind(CompleteProfileUseCase).toSelf().inTransientScope()
  }
}
```

**Dos pasos manuales siempre requeridos:**

1. `apps/api/src/common/ioc/bootstrap.ts` — cargar el módulo:
   ```ts
   container.load(new PatientsModule())
   ```

2. `apps/api/src/app.ts` — registrar el router:
   ```ts
   app.use('/patients', patientsRouter)
   ```

**Regla:** si falta cualquiera de los dos pasos, Inversify lanzará un error en runtime al intentar resolver dependencias.
