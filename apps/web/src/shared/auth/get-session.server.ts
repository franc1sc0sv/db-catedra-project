import 'server-only'
import { auth } from '@project/auth/src/auth'
import { headers } from 'next/headers'

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}
