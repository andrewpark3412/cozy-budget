export interface Debt {
  id: string
  userId: string
  name: string
  originalBalance: number // stored as cents
  currentBalance: number // stored as cents
  interestRate: number // percentage e.g. 5.5 = 5.5%
  minimumPayment: number // stored as cents
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number // stored as cents
  paymentDate: string // ISO date string YYYY-MM-DD
  createdAt: string
}
