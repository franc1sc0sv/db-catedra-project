import { z } from 'zod'

export const blockTypeSchema = z.enum(['meeting', 'vacation', 'block'])

const timeRegex = /^\d{2}:\d{2}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createBlockInputSchema = z.object({
  date:      z.string().regex(dateRegex, 'Fecha inválida').refine((value) => {
    const today = new Date().toISOString().slice(0, 10)
    return value >= today
  }, 'La fecha no puede ser pasada'),
  startTime: z.string().regex(timeRegex, 'Hora inicio inválida'),
  endTime:   z.string().regex(timeRegex, 'Hora fin inválida'),
  blockType: blockTypeSchema,
}).refine((value) => value.startTime < value.endTime, {
  message: 'La hora de inicio debe ser menor que la de fin',
  path:    ['endTime'],
})

export type BlockType        = z.infer<typeof blockTypeSchema>
export type CreateBlockInput = z.infer<typeof createBlockInputSchema>

export const scheduleEventSchema = z.object({
  id:        z.string().uuid(),
  eventDate: z.string(),
  startTime: z.string(),
  endTime:   z.string(),
  eventType: z.enum(['appointment', 'block', 'vacation', 'meeting']),
})

export type ScheduleEventModel = z.infer<typeof scheduleEventSchema>

export const slotDurationSchema = z.union([
  z.literal(15), z.literal(30), z.literal(45), z.literal(60),
])

export const generateScheduleInputSchema = z.object({
  selectedDays:  z.array(z.number().int().min(0).max(6)).min(1, 'Selecciona al menos un día'),
  startTime:     z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime:       z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  slotDuration:  slotDurationSchema,
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const scheduleSlotSchema = z.object({
  eventDate: z.string(),
  startTime: z.string(),
  endTime:   z.string(),
})

export const previewScheduleOutputSchema = z.object({
  preview:     z.array(scheduleSlotSchema),
  conflicting: z.array(scheduleSlotSchema),
})

export const generateScheduleOutputSchema = z.object({
  created: z.number().int(),
  skipped: z.number().int(),
})

export type SlotDuration            = z.infer<typeof slotDurationSchema>
export type GenerateScheduleInput   = z.infer<typeof generateScheduleInputSchema>
export type ScheduleSlot            = z.infer<typeof scheduleSlotSchema>
export type PreviewScheduleOutput   = z.infer<typeof previewScheduleOutputSchema>
export type GenerateScheduleOutput  = z.infer<typeof generateScheduleOutputSchema>
