import { treaty } from '@elysiajs/eden'
import type { App } from '@project/api/src/app'

export const clientApi = treaty<App>(process.env.NEXT_PUBLIC_API_URL!, {
  fetch: { credentials: 'include' },
})
