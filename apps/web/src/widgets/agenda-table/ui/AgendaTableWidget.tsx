import type { ReceptionistAgendaItemOutput } from '@project/api/src/modules/receptionist-agenda/application/dtos/outputs/receptionist-agenda-item.output'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { UnblockSlotButton } from '@/features/block-schedule'

export type AgendaItem = ReceptionistAgendaItemOutput

interface AgendaTableWidgetProps {
  items: AgendaItem[]
  fecha: string
}

const ROW_VARIANT: Record<string, string> = {
  available: 'bg-card',
  busy:      'bg-primary/5 border-l-4 border-l-primary',
  blocked:   'bg-warning/10 border-l-4 border-l-warning',
  completed: 'bg-success/10 border-l-4 border-l-success',
  cancelled: 'bg-destructive/10 border-l-4 border-l-destructive opacity-70',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponible',
  busy:      'Reservado',
  blocked:   'Bloqueado',
  completed: 'Atendido',
  cancelled: 'Cancelado',
}

const BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  available: 'outline',
  busy:      'default',
  blocked:   'warning',
  completed: 'success',
  cancelled: 'destructive',
}

function formatTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export function AgendaTableWidget({ items }: AgendaTableWidgetProps) {
  if (!Array.isArray(items)) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          La agenda recibida no tiene el formato esperado.
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No hay agenda configurada para esta fecha.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const status = item.availabilityStatus
            const rowClass = ROW_VARIANT[status] ?? 'bg-card'
            const label = STATUS_LABEL[status] ?? status
            const badge = BADGE_VARIANT[status] ?? 'outline'
            return (
              <TableRow key={item.slotId} className={cn(rowClass)}>
                <TableCell className="font-medium">
                  {formatTime(item.startTime)} – {formatTime(item.endTime)}
                </TableCell>
                <TableCell>
                  <Badge variant={badge}>{label}</Badge>
                </TableCell>
                <TableCell>{item.patientName ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{item.bookingReason ?? '—'}</TableCell>
                <TableCell>{item.whatsappPhone ?? '—'}</TableCell>
                <TableCell className="text-right">
                  {status === 'blocked'
                    ? <UnblockSlotButton slotId={item.slotId} />
                    : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
