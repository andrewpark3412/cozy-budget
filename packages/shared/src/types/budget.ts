export interface Budget {
  id: string
  userId: string
  month: number // 1–12
  year: number
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  budgetId: string
  categoryId: string
  plannedAmount: number // stored as cents
  createdAt: string
  updatedAt: string
}

export interface BudgetSummary {
  budget: Budget
  totalIncome: number
  totalPlanned: number
  totalSpent: number
  leftToBudget: number
}
