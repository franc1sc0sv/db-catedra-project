# Mis Citas — Standards

## frontend/thin-pages

`page.tsx` renderiza un único componente view. No contiene lógica, fetching ni estado. Ejemplo:

```tsx
// apps/web/src/app/(patient)/mis-citas/page.tsx
import { MisCitasPage } from "@/views/mis-citas";

export default function Page(props: { searchParams: Promise<{ page?: string }> }) {
  return <MisCitasPage {...props} />;
}
```

## frontend/entity-schemas

Los tipos e interfaces de dominio viven en `entities/[name]/model/types.ts`. Si se usan validaciones en runtime, los esquemas Zod van en `entities/[name]/model/schemas.ts`. Los tipos se re-exportan desde `entities/[name]/index.ts`.

```
entities/appointment/
  model/
    types.ts       ← AppointmentStatus, Appointment, ClinicalData, AppointmentWithClinical
    schemas.ts     ← zod schemas (si se necesitan)
  index.ts         ← re-export público
```

## frontend/fsd-layer-imports

El flujo de importaciones sigue la jerarquía FSD:

```
views → widgets → features → entities → shared
```

- `views` puede importar de `widgets`, `features`, `entities`, `shared`.
- `widgets` puede importar de `features`, `entities`, `shared`.
- `features` puede importar de `entities`, `shared`.
- `entities` puede importar de `shared`.
- `shared` no importa de ninguna capa superior.

Nunca importar en dirección contraria (e.g., `entities` importando de `widgets`).

## backend/repository-pattern

Cada repositorio sigue esta estructura:

1. **Interfaz abstracta** — clase abstracta con métodos tipados.
2. **`toEntity()`** — método privado que convierte `$inferSelect` de Drizzle al tipo de dominio.
3. **`TxClient`** — soporte opcional para recibir una transacción en lugar de `db`.
4. **Implementación Drizzle** — extiende la clase abstracta, inyecta `db` vía Inversify.

```ts
// Patrón de inferencia de tipos
type DrizzleAppointment = typeof medicalAppointments.$inferSelect;
type DrizzleEvent = typeof scheduleEvents.$inferSelect;

function toEntity(row: DrizzleAppointment & { scheduleEvent: DrizzleEvent }): Appointment {
  return { /* mapeo */ };
}
```

## Relational query con join opcional (Drizzle)

```ts
// Left join implícito — clinicalConsultation puede ser null
const rows = await db.query.medicalAppointments.findMany({
  where: eq(medicalAppointments.patientDui, patientDui),
  with: {
    scheduleEvent: true,
    clinicalConsultation: true,   // null si no existe
  },
  limit: pageSize,
  offset: (page - 1) * pageSize,
});
```

## Paginated Server Component (Next.js)

```tsx
// View RSC — lee searchParams asincrónicamente (Next.js 15+)
export default async function MisCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1");
  const session = await getSession();
  // fetch via Eden Treaty ...
}
```
