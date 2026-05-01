# References: registro-perfil

Punteros de código existente que sirven como plantilla para implementar esta feature.

---

## LoginForm — patrón de feature form con react-hook-form + zod

**Ruta:** `apps/web/src/features/auth/ui/LoginForm.tsx`

Referencia para:
- Directiva `'use client'` al inicio.
- `useForm<T>({ resolver: zodResolver(schema) })` con schema importado desde la entidad.
- `<form onSubmit={handleSubmit(onSubmit)}>` con `FormField`, `Input`, `Label`, `Button` de `@/components/ui/`.
- Manejo de errores de servidor con `<Alert variant="destructive">` en español.
- Estado de carga con `isSubmitting` del `formState`.

Usar el mismo patrón en `CompleteProfileForm.tsx`, extendiendo con campos adicionales y el indicador de progreso de dos pasos.

---

## LoginPage — patrón de view con shadcn Card

**Ruta:** `apps/web/src/views/login/ui/LoginPage.tsx`

Referencia para:
- Server Component (sin `'use client'`).
- Envolver la feature en `<Card>`, `<CardHeader>`, `<CardContent>`.
- Pasar props del servidor al componente de feature (ej. lista de aseguradoras).
- Lógica de redirección con `redirect()` de `next/navigation` si el usuario ya está autenticado.

Usar el mismo patrón en `CompleteProfilePage.tsx`.

---

## `entities/user/index.ts` — patrón de public API

**Ruta:** `apps/web/src/entities/user/index.ts`

Referencia para:
- Reexportar schemas y tipos desde `./model/schemas` y `./model/types`.
- Mantener el barrel como único punto de entrada del slice.

Replicar exactamente en `apps/web/src/entities/patient/index.ts`.

---

## `entities/user/model/schemas.ts` — patrón de schema Zod + inferred type

**Ruta:** `apps/web/src/entities/user/model/schemas.ts`

Referencia para:
- Definir el schema Zod y exportar el tipo inferido en el mismo archivo.
- Naming: `[feature]Schema` + `[Feature]Values` para el tipo.

Replicar en `apps/web/src/entities/patient/model/schemas.ts` con el schema de `completeProfileSchema`.

---

## `shared/api/client.ts` — Eden Treaty client

**Ruta:** `apps/web/src/shared/api/client.ts`

Referencia para:
- `api` — instancia de Eden Treaty para Server Components (usa `fetch` nativo).
- `clientApi` — instancia para Client Components (requiere `'use client'` en el consumidor).

En `CompleteProfileForm.tsx` usar `clientApi.patients['complete-profile'].post(body)`.
En `CompleteProfilePage.tsx` usar `api.insurances.list.get()` para obtener la lista de aseguradoras.

---

## `shared/auth/client.ts` — Better Auth browser client

**Ruta:** `apps/web/src/shared/auth/client.ts`

Referencia para:
- `signUp.email({ email, password, name })` — registro de cuenta (paso 1).
- `useSession()` — verificar `session.user.emailVerified` antes de mostrar el paso 2.
- `sendVerificationEmail()` — reenviar enlace desde la pantalla `/verify-email`.

---

## `users.module.ts` — patrón de AppModule (backend)

**Ruta:** `apps/api/src/modules/users/users.module.ts`

Referencia para:
- Estructura de `AppModule.load(container)`.
- Binding de `Repository` (singleton) y use cases (transient).

Replicar en `apps/api/src/modules/patients/patients.module.ts`.

---

## `users.routes.ts` — patrón de createRouter + betterAuthPlugin (backend)

**Ruta:** `apps/api/src/modules/users/presentation/users.routes.ts`

Referencia para:
- `createRouter()` con `betterAuthPlugin` para rutas protegidas.
- Extracción de `context.user.id` del token de sesión.
- Validación de body con schema Elysia inline.

Replicar en `apps/api/src/modules/patients/presentation/patients.routes.ts`.

---

## `get-me.usecase.ts` — patrón de BaseUseCase (backend)

**Ruta:** `apps/api/src/modules/users/application/usecases/get-me.usecase.ts`

Referencia para:
- `@injectable()` + `extends BaseUseCase<In, Out>`.
- `@inject(Token)` en el constructor.
- Separación entre `handle()` (lógica) y `execute()` (orquestación/transacción).
- `AppError` para errores de negocio.

Replicar en `apps/api/src/modules/patients/application/usecases/complete-profile.usecase.ts`.
