import type { UserOutput } from '@project/api/src/modules/users/application/dtos/outputs/user.output'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EditUserButton, DeactivateUserButton } from '@/features/user-management'

interface UsersTableWidgetProps {
  items: UserOutput[]
  total: number
}

const ROLE_LABEL: Record<UserOutput['role'], string> = {
  doctor:       'Doctor',
  patient:      'Paciente',
  receptionist: 'Recepcionista',
}

const ROLE_TONE: Record<UserOutput['role'], 'default' | 'secondary' | 'success'> = {
  doctor:       'default',
  patient:      'success',
  receptionist: 'secondary',
}

export function UsersTableWidget({ items, total }: UsersTableWidgetProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No hay usuarios registrados todavía.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{total} usuario(s) en total</p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => {
              const inactive = user.accountStatus !== 'active'
              return (
                <TableRow key={user.id} className={inactive ? 'opacity-60' : undefined}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={inactive ? 'destructive' : 'success'}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <EditUserButton user={user} />
                    {!inactive && <DeactivateUserButton userId={user.id} userName={user.name} />}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
