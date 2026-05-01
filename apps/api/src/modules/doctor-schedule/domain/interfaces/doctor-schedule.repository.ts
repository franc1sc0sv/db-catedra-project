import type { TxClient } from '@project/db/src/client'
import type { ISlotCandidate } from '../entities/slot-candidate.entity'

export abstract class IDoctorScheduleRepository {
  abstract findOverlappingKeys(
    doctorId: string,
    candidates: ISlotCandidate[],
    tx: TxClient,
  ): Promise<Set<string>>
  abstract bulkInsert(
    doctorId: string,
    candidates: ISlotCandidate[],
    auditUserId: string,
    tx: TxClient,
  ): Promise<void>
}
