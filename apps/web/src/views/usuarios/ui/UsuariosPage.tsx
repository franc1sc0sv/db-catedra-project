import { createServerApi } from '@/shared/api/server'
import { UsersTableWidget } from '@/widgets/users-table'
import { CreateUserDialog } from '@/features/user-management'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface UsuariosPageProps {
  page?: string
}

export async function UsuariosPage({ page }: UsuariosPageProps) {
  const api = await createServerApi()
  const { data, error } = await api.users.list.get({
    query: { page: page ?? '1', pageSize: '20' },
  })

  if (error || !data) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
          <h1>Usuarios</h1>
        </header>
        <Card>
          <CardContent>
            <Alert variant="destructive" className="text-sm">
              No se pudo cargar la lista de usuarios.
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
          <h1>Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra cuentas de pacientes, recepcionistas y otros médicos.
          </p>
        </header>
        <CreateUserDialog />
      </div>

      <UsersTableWidget items={data.items} total={data.total} />
    </div>
  )
}
