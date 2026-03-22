export interface RecurringItem {
  id: string
  userId: string
  categoryId: string
  name: string
  amount: number // stored as cents
  dayOfMonth: number // 1–31
  isActive: boolean
  createdAt: string
  updatedAt: string
}
