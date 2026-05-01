import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@project/db/src/client'
import { Users, Sessions, Accounts, Verifications } from '@project/db/src/schema/iam.schema'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: [
    process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001',
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: Users,
      session: Sessions,
      account: Accounts,
      verification: Verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: ['doctor', 'patient', 'receptionist'],
        required: false,
        defaultValue: 'patient',
        input: false,
      },
      accountStatus: {
        type: ['active', 'inactive'],
        required: false,
        defaultValue: 'active',
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // No-op stub: real email integration is out of scope for the MVP.
      // The verification URL is logged so manual flows can pick it up.
      console.log(`[emailVerification] ${user.email} -> ${url}`)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    database: {
      generateId: () => crypto.randomUUID(),
    },
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type SessionUser = Session['user']
