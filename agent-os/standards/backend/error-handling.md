# Error Handling

Throw `AppError` for all expected domain/business errors. Never try/catch inside use cases or routes.

```ts
throw new AppError('User not found', 404)
throw new AppError('Insufficient permissions', 403)
throw new AppError('Invalid input')  // defaults to 400
```

The global handler in `app.ts` catches `AppError` and returns:
```json
{ "message": "User not found" }
```
with the matching HTTP status code.

- Do NOT wrap use-case calls in try/catch in routes — let `AppError` bubble up
- Do NOT add custom error classes; always use `AppError(message, statusCode)`
- Unexpected errors (non-AppError) fall through to Elysia's default 500 handler
