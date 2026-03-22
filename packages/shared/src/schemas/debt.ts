import { z } from 'zod'

export const createDebtSchema = z.object({
  name: z.string().min(1).max(200),
  originalBalance: z.number().int().positive(), // cents
  currentBalance: z.number().int().nonnegative(), // cents
  interestRate: z.number().min(0).max(100), // percentage
  minimumPayment: z.number().int().nonnegative(), // cents
})

export const updateDebtSchema = createDebtSchema.partial()

export const recordDebtPaymentSchema = z.object({
  amount: z.number().int().positive(), // cents
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

export const reorderDebtsSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
})

export type CreateDebtInput = z.infer<typeof createDebtSchema>
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>
export type RecordDebtPaymentInput = z.infer<typeof recordDebtPaymentSchema>
export type ReorderDebtsInput = z.infer<typeof reorderDebtsSchema>
