import { t, type Static } from 'elysia'
import { ScheduleSlotOutputSchema } from './schedule-slot.output'

export const PreviewScheduleOutputSchema = t.Object({
  preview:    t.Array(ScheduleSlotOutputSchema),
  conflicting: t.Array(ScheduleSlotOutputSchema),
})

export type PreviewScheduleOutput = Static<typeof PreviewScheduleOutputSchema>
