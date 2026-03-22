import { z } from 'zod'

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1).max(200),
  targetAmount: z.number().int().positive(), // cents
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .optional(),
})

export const updateSavingsGoalSchema = createSavingsGoalSchema.partial()

export const addSavingsContributionSchema = z.object({
  amount: z.number().int().positive(), // cents
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>
export type AddSavingsContributionInput = z.infer<typeof addSavingsContributionSchema>
