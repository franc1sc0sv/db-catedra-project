import { inject, injectable } from 'inversify'
import { IDoctorAgendaRepository } from '../../domain/interfaces/doctor-agenda.repository'
import { AppError } from '~/common/errors/app-error'

type BlockSlotInput = {
  doctorId: string
  fecha: string
  start: string
  end: string
}

@injectable()
export class BlockSlotUseCase {
  constructor(
    @inject(IDoctorAgendaRepository)
    private readonly repo: IDoctorAgendaRepository,
  ) {}

  async execute(input: BlockSlotInput) {

    if (input.start >= input.end) {
      throw new AppError('Hora de inicio debe ser menor que hora fin', 400)
    }

    const overlap = await this.repo.hasOverlap(input)

    if (overlap) {
      throw new AppError('El horario ya está ocupado o bloqueado', 400)
    }

    await this.repo.blockSlot(input)

    return {
      success: true,
      message: 'Horario bloqueado correctamente',
    }
  }
}