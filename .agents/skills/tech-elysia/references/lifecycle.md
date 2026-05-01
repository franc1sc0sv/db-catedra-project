# Elysia Lifecycle Reference

## Event Order

```
Request → Parse → Transform → BeforeHandle → Handler → AfterHandle → MapResponse → AfterResponse
                                                              ↑
                                                          OnError (any stage)
```

## Hook Registration

```typescript
new Elysia()
  .onRequest(({ request }) => { /* fires on every request, even 404 */ })
  .onParse(({ request, contentType }) => { /* custom body parser */ })
  .onTransform(({ body, set }) => { /* modify context before validation */ })
  .onBeforeHandle(({ set, cookie }) => { /* auth guards, return early */ })
  .onAfterHandle(({ response }) => { /* transform response value */ })
  .onMapResponse(({ response }) => { /* convert to web Response */ })
  .onError(({ code, error, set }) => { /* error handling */ })
  .onAfterResponse(({ response }) => { /* cleanup, logging */ })
```

## Critical Rule — Order Matters

Hooks apply only to routes registered **after** them:

```typescript
new Elysia()
  .onBeforeHandle(authCheck)   // ✅ applies to /protected below
  .get('/protected', handler)
  .get('/public', handler)     // ✅ also gets authCheck (registered after hook)

// WRONG — hook after route doesn't apply
new Elysia()
  .get('/protected', handler)
  .onBeforeHandle(authCheck)   // ❌ does NOT apply to /protected above
```

## Scope — Local vs Global

By default, lifecycle in a plugin is **isolated** (local):

```typescript
const authPlugin = new Elysia()
  .onBeforeHandle(({ cookie }) => checkAuth(cookie))  // local — stays in plugin
  .get('/profile', () => 'profile')

new Elysia()
  .use(authPlugin)
  .get('/other', () => 'other')  // ❌ does NOT inherit auth check
```

To export lifecycle to parent/siblings, use `{ as: 'scoped' | 'global' }`:

```typescript
const authPlugin = new Elysia()
  .onBeforeHandle({ as: 'scoped' }, ({ cookie }) => checkAuth(cookie))
  // 'scoped'  → parent + current + descendants
  // 'global'  → all instances

const authPlugin = new Elysia()
  .onBeforeHandle({ as: 'global' }, ({ cookie }) => checkAuth(cookie))
```

| `as` | child | current | parent | grandparent |
|---|---|---|---|---|
| `local` (default) | ✅ | ✅ | ❌ | ❌ |
| `scoped` | ✅ | ✅ | ✅ | ❌ |
| `global` | ✅ | ✅ | ✅ | ✅ |

## BeforeHandle — Guards & Auth

Return a value to short-circuit the handler:

```typescript
.onBeforeHandle(({ cookie, set }) => {
  if (!cookie.session.value) {
    set.status = 401
    return 'Unauthorized'
  }
})
```

## AfterHandle — Response Transform

Return a new value to replace the response (undefined keeps original):

```typescript
.onAfterHandle(({ response, set }) => {
  if (typeof response === 'string' && response.startsWith('<')) {
    set.headers['content-type'] = 'text/html; charset=utf8'
  }
})
```

## OnError — Centralized Error Handling

```typescript
.onError(({ code, error, set }) => {
  switch (code) {
    case 'NOT_FOUND':
      return { message: 'Resource not found' }
    case 'VALIDATION':
      set.status = 422
      return { message: error.message, issues: error.all }
    case 'INTERNAL_SERVER_ERROR':
      console.error(error)
      return { message: 'Internal server error' }
  }
})
```

Built-in error codes: `NOT_FOUND`, `VALIDATION`, `PARSE`, `INTERNAL_SERVER_ERROR`, `UNKNOWN`.

## Inline Hooks (per-route)

```typescript
.get('/user/:id', ({ params }) => getUser(params.id), {
  beforeHandle: [authCheck, rateLimit],
  afterHandle: ({ response }) => sanitize(response)
})
```
