import { LoginPage } from '@/views/login'

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams
  return <LoginPage registered={registered === '1'} />
}
