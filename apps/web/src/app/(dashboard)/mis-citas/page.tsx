import { MisCitasPage } from '@/views/mis-citas'

export const metadata = { title: 'Mis citas' }

export default async function MisCitasRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  return <MisCitasPage page={page} />
}
