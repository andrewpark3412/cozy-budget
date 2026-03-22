export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: number // stored as cents
  currentAmount: number // stored as cents
  targetDate: string | null // ISO date string YYYY-MM-DD
  isComplete: boolean
  createdAt: string
  updatedAt: string
}
