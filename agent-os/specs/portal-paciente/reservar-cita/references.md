# References: Reservar Cita

Punteros a archivos existentes en el codebase que sirven como modelo para implementar esta feature.

---

## Frontend

### Client Component con react-hook-form + shadcn
`apps/web/src/features/auth/ui/LoginForm.tsx`
Patrón de referencia para `ReservarCitaForm.tsx`: uso de `useForm`, `zodResolver`, campos de shadcn, estado de submit.

### View composition con shadcn Card
`apps/web/src/views/login/ui/LoginPage.tsx`
Patrón para `ReservarCitaPage.tsx`: composición de layout con Card y renderizado de feature component.

### clientApi para mutaciones en el browser
`apps/web/src/shared/api/client.ts`
Singleton de Eden Treaty para llamadas desde Client Components. `ReservarCitaForm` debe usar este cliente para `POST /appointments`.

---

## API

### BaseUseCase pattern
`apps/api/src/modules/users/application/usecases/get-me.usecase.ts`
Ejemplo de `@injectable()`, `BaseUseCase<TInput, TOutput>`, `handle()`, inyección de dependencias.

### Route con betterAuthPlugin + container.get()
`apps/api/src/modules/users/presentation/users.routes.ts`
Patrón para `appointments.routes.ts`: cómo registrar una ruta Elysia con autenticación y resolver el use case desde el contenedor Inversify.

---

## Notas de implementación

- El `eventId` llega como parámetro de URL `[eventId]` en Next.js App Router. En Next.js 15+, `params` es una Promise — usar `await params` antes de destructurar (ver `next-best-practices/async-patterns.md`).
- El `patientDui` se obtiene del perfil del paciente autenticado, no del body del request. El use case debe resolverlo a partir de la sesión.
- El constraint UNIQUE en `MedicalAppointments.eventId` es la única garantía de atomicidad contra race conditions. La validación previa en el use case es una mejora de UX, no el mecanismo de seguridad.
