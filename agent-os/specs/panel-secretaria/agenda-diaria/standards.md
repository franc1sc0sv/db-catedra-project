# Standards aplicados: Agenda Diaria

## frontend/thin-pages
`page.tsx` sólo parsea `searchParams` (await requerido en Next.js 15+) y renderiza un único componente view. No contiene lógica de negocio ni fetching directo.

```tsx
// apps/web/src/app/(receptionist)/agenda/page.tsx
export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  const { fecha } = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  return <AgendaSecretariaPage fecha={fecha ?? today} />;
}
```

## frontend/fsd-layer-imports
Dirección de dependencias estricta: views → widgets → features → entities → shared.
- `AgendaSecretariaPage` (views) importa `AgendaTableWidget` (widgets) y `DateNav` (widgets).
- `AgendaTableWidget` importa componentes de `@/components/ui/` (shared).
- Ningún widget importa desde views.

## backend/repository-pattern
- Repositorio definido como abstract class (token Inversify).
- Método de consulta tipado con `$inferSelect` de la vista Drizzle.
- Mapper `toReceptionistOutput()` convierte fila de BD a DTO limpio.
- Soporte para `TxClient` en la firma del método (aunque esta operación es solo lectura).

```ts
// Patrón de método en repositorio
abstract getDailyAgendaForReceptionist(
  fecha: Date,
  tx?: TxClient,
): Promise<ReceptionistAgendaItemOutput[]>;
```

## backend/use-case-per-operation
Cada operación de negocio tiene su propio use case. `GetDailyAgendaReceptionistUseCase` es independiente de cualquier use case de pacientes o administración. Recibe el repositorio por inyección de dependencias vía Inversify.

## tailwind/row-color-variants
Variantes de color por estado aplicadas a la fila de tabla sin clases dinámicas (para que el tree-shaking de Tailwind funcione correctamente):

```ts
const rowVariants: Record<string, string> = {
  available:  'bg-white',
  busy:       'bg-blue-50 border-l-4 border-l-blue-400',
  blocked:    'bg-amber-50 border-l-4 border-l-amber-400',
  completed:  'bg-green-50 border-l-4 border-l-green-400',
  cancelled:  'bg-red-50 border-l-4 border-l-red-300 opacity-60',
};
```

## next/async-searchParams
En Next.js 15+ `searchParams` es una Promise. Siempre se hace `await searchParams` en el Server Component de la página antes de leer sus propiedades.
