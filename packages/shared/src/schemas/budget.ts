import { z } from 'zod'

export const createBudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

export const createBudgetItemSchema = z.object({
  categoryId: z.string().uuid(),
  plannedAmount: z.number().int().nonnegative(), // cents
})

export const updateBudgetItemSchema = z.object({
  plannedAmount: z.number().int().nonnegative(),
})

export const copyBudgetSchema = z.object({
  sourceMonth: z.number().int().min(1).max(12),
  sourceYear: z.number().int().min(2020).max(2100),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
export type CopyBudgetInput = z.infer<typeof copyBudgetSchema>
