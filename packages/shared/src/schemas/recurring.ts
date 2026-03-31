import { z } from 'zod'

export const createRecurringItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  amount: z.number().int().positive(), // cents
  dayOfMonth: z.number().int().min(1).max(31),
})

export const updateRecurringItemSchema = createRecurringItemSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateRecurringItemInput = z.infer<typeof createRecurringItemSchema>
export type UpdateRecurringItemInput = z.infer<typeof updateRecurringItemSchema>
