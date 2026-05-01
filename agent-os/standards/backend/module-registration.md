# Module Registration

Each domain area has an `AppModule` class that registers DI bindings.

```ts
// modules/things/things.module.ts
export class ThingsModule implements AppModule {
  load(container: Container): void {
    container.bind(IThingsRepository).to(DrizzleThingsRepository).inRequestScope()
    container.bind(DoSomethingUseCase).toSelf().inRequestScope()
  }
}
```

Adding a new module requires **two** manual steps:

1. **bootstrap.ts** — add to the kernel:
   ```ts
   ApplicationKernel.getInstance([..., new ThingsModule()])
   ```
2. **app.ts** — mount the routes:
   ```ts
   app.use(thingsRoutes)
   ```

Missing either step causes silent failures (DI throws at runtime / routes are unreachable).
