import { z } from 'zod'

export const createTransactionSchema = z.object({
  budgetItemId: z.string().uuid(),
  amount: z.number().int().positive(), // cents
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().max(500).nullable().optional(),
})

export const updateTransactionSchema = z.object({
  amount: z.number().int().positive().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  note: z.string().max(500).nullable().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
