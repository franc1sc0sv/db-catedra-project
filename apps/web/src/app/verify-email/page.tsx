import { redirect } from 'next/navigation'
import { requireAuth } from '@/shared/auth/guards.server'
import { VerifyEmailPage } from '@/views/verify-email'

export default async function VerifyEmailRoute() {
  const session = await requireAuth()

  if (session.user.emailVerified) {
    redirect('/dashboard')
  }

  return <VerifyEmailPage email={session.user.email} />
}
