# Standards — Datos Semilla

## use-case-pattern

Aplica a los use cases de la API (`apps/api`). El seed no es un use case, pero comparte el principio de atomicidad.

### Regla

Todo use case de la API debe:

1. Extender `BaseUseCase<TInput, TOutput>`
2. Decorarse con `@injectable()` (Inversify)
3. Implementar `handle(input: TInput): Promise<TOutput>` — contiene la lógica de negocio
4. Implementar `execute(input: TInput): Promise<TOutput>` — envuelve `handle()` en una transacción Drizzle

### Estructura canónica

```typescript
import { injectable } from 'inversify';
import { BaseUseCase } from '@/shared/base-use-case';
import { db } from '@/db';

@injectable()
export class CreatePatientUseCase extends BaseUseCase<CreatePatientDTO, Patient> {
  async handle(input: CreatePatientDTO): Promise<Patient> {
    // lógica de negocio aquí
    const [patient] = await db.insert(patients).values(input).returning();
    return patient;
  }

  async execute(input: CreatePatientDTO): Promise<Patient> {
    return db.transaction(() => this.handle(input));
  }
}
```

### Por qué

- `handle()` separado de `execute()` permite testear la lógica sin transacción
- `@injectable()` permite que Inversify resuelva dependencias automáticamente
- La transacción en `execute()` garantiza atomicidad sin duplicar la lógica

### Aplicación en este feature

El seed no es un use case de la API, pero aplica el mismo principio: toda la lógica de inserción está dentro de `db.transaction()` para garantizar que la BD quede en estado consistente o completamente limpia.
