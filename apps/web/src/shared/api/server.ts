import 'server-only'
import { headers } from 'next/headers'
import { treaty } from '@elysiajs/eden'
import type { App } from '@project/api/src/app'

function resolveApiUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!url) throw new Error('API_URL or NEXT_PUBLIC_API_URL must be set')
  return url
}

export async function createServerApi() {
  const cookie = (await headers()).get('cookie') ?? ''
  return treaty<App>(resolveApiUrl(), {
    headers: { cookie },
  })
}

export const api = treaty<App>(resolveApiUrl())
