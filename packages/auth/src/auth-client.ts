import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { useSession, signIn, signOut, signUp } = authClient
