import { Elysia } from 'elysia'
import { auth } from '@project/auth/src/auth'

export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .all('/api/auth/*', async ({ request, server }) => {
    const headers = new Headers(request.headers)
    if (!headers.has('x-forwarded-for')) {
      const ip = server?.requestIP(request)?.address
      if (ip) headers.set('x-forwarded-for', ip)
    }
    const forwarded = new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error - Bun supports duplex for streaming bodies
      duplex: 'half',
    })
    return auth.handler(forwarded)
  })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })
        return { user: session.user, session: session.session }
      },
    },
    roles: (allowed: string[]) => ({
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })
        if (!allowed.includes(session.user.role as string)) {
          return status(403, { message: 'Forbidden' })
        }
        return { user: session.user, session: session.session }
      },
    }),
  })
