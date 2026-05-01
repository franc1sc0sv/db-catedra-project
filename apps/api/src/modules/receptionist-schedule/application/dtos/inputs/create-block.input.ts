import { t, type Static } from 'elysia'

export const BlockTypeSchema = t.Union([
  t.Literal('meeting'),
  t.Literal('vacation'),
  t.Literal('block'),
])

export const CreateBlockInputSchema = t.Object({
  doctorId:  t.String({ format: 'uuid' }),
  date:      t.String({ format: 'date' }),
  startTime: t.String(),
  endTime:   t.String(),
  blockType: BlockTypeSchema,
})

export type CreateBlockInput = Static<typeof CreateBlockInputSchema>
export type BlockType        = Static<typeof BlockTypeSchema>
