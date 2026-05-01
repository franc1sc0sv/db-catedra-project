import type { TxClient } from '@project/db/src/client'
import type { IAgendaItem } from '../entities/agenda-item.entity'

export type BlockSlotInput = {
  doctorId: string
  fecha: string
  start: string
  end: string
}

export abstract class IDoctorAgendaRepository {
  abstract getDailyAgenda(
    doctorId: string,
    fecha: string,
    tx: TxClient
  ): Promise<IAgendaItem[]>

  abstract blockSlot(
    input: BlockSlotInput
  ): Promise<void>

  abstract hasOverlap(
    input: BlockSlotInput
  ): Promise<boolean>
}