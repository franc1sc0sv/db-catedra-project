import { UsuariosPage } from '@/views/usuarios'

export const metadata = { title: 'Usuarios' }

export default async function UsuariosRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  return <UsuariosPage page={page} />
}
