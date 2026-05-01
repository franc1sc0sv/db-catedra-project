# Repository Pattern

Repository interfaces are **abstract classes**, not TypeScript interfaces.
Inversify needs a runtime value as injection token; TS interfaces are erased at compile time.

```ts
// domain/interfaces/things.repository.ts
export abstract class IThingsRepository extends IBaseRepository<IThing> {
  abstract findByName: RepositoryMethod<[name: string], IThing | null>
}

// infrastructure/repositories/drizzle-things.repository.ts
@injectable()
export class DrizzleThingsRepository extends IThingsRepository {
  findById = async (id: string, tx: TxClient): Promise<IThing | null> => { ... }
  findByName = async (name: string, tx: TxClient): Promise<IThing | null> => { ... }
}
```

- Always map DB rows to domain entities with a private `toEntity(row)` function — never return raw rows
- Use `$inferSelect` as the row type: `type ThingRow = typeof Things.$inferSelect`
- All methods accept `tx: TxClient` as last argument (provided by `BaseUseCase`)
- Bind in the module: `container.bind(IThingsRepository).to(DrizzleThingsRepository).inRequestScope()`
