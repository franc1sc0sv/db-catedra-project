# UseCase Pattern

All use cases extend `BaseUseCase<TInput, TOutput>` and are decorated with `@injectable()`.

```ts
@injectable()
export class DoSomethingUseCase extends BaseUseCase<Input, Output> {
  constructor(private readonly repo: ISomeRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<Output> {
    // business logic here
  }
}
```

- `execute()` (inherited) wraps every call in a DB transaction automatically — do not override it
- Business logic lives in `handle()`, never in `execute()`
- After creating a use case, bind it in the module: `container.bind(DoSomethingUseCase).toSelf().inRequestScope()`
- Throw `AppError` for domain errors; do not try/catch inside `handle()`
