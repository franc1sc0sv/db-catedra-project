import type { TxClient } from '@project/db/src/client'
import type { IAgendaSlot } from '../entities/agenda-slot.entity'

export abstract class IReceptionistAgendaRepository {
  abstract getDailyAgendaForReceptionist(
    doctorId: string,
    fecha: string,
    tx: TxClient,
  ): Promise<IAgendaSlot[]>
}
