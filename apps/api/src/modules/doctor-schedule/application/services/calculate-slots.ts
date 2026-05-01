import type { ISlotCandidate } from '../../domain/entities/slot-candidate.entity'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function fromMinutes(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00`
}

function formatDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export interface CalculateSlotsInput {
  selectedDays:  number[]
  startTime:     string
  endTime:       string
  slotDuration:  number
  weekStartDate: string
}

export function calculateSlots(input: CalculateSlotsInput): ISlotCandidate[] {
  const { selectedDays, startTime, endTime, slotDuration, weekStartDate } = input

  const start = toMinutes(startTime)
  const end   = toMinutes(endTime)
  if (end <= start) return []

  const base = new Date(`${weekStartDate}T00:00:00.000Z`)
  if (Number.isNaN(base.getTime())) return []

  const dayStart = new Date(Date.UTC(
    base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(),
  ))
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const selected = new Set(selectedDays)
  const slots: ISlotCandidate[] = []

  for (let offset = 0; offset < 7; offset++) {
    const cursor = new Date(dayStart.getTime() + offset * MS_PER_DAY)
    if (!selected.has(cursor.getUTCDay())) continue
    if (cursor < today) continue

    const eventDate = formatDate(cursor)
    for (let m = start; m + slotDuration <= end; m += slotDuration) {
      slots.push({
        eventDate,
        startTime: fromMinutes(m),
        endTime:   fromMinutes(m + slotDuration),
      })
    }
  }

  return slots
}

export function slotKey(slot: ISlotCandidate): string {
  return `${slot.eventDate}|${slot.startTime}`
}
