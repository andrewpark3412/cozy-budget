import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Budget,
  BudgetItem,
  Category,
  Transaction,
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
  CopyBudgetInput,
} from '@cozy-budget/shared'

// Enriched types returned by the API (with joined relations)
export interface BudgetItemWithRelations extends BudgetItem {
  category: Category
  transactions: Transaction[]
}

export interface BudgetWithItems extends Budget {
  recurringApplied: number
  items: BudgetItemWithRelations[]
}

function budgetKey(month: number, year: number) {
  return ['budget', month, year] as const
}

export function useBudget(month: number, year: number) {
  return useQuery({
    queryKey: budgetKey(month, year),
    queryFn: async () => {
      const res = await api.get<BudgetWithItems>(
        `/api/budgets?month=${month}&year=${year}`,
      )
      if (res.error) throw new Error(res.error)
      return res.data
    },
  })
}

export function useAddBudgetItem(budgetId: string, month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBudgetItemInput) => {
      const res = await api.post<BudgetItemWithRelations>(
        `/api/budgets/${budgetId}/items`,
        input,
      )
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

export function useUpdateBudgetItem(budgetId: string, month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      ...input
    }: UpdateBudgetItemInput & { itemId: string }) => {
      const res = await api.patch<BudgetItemWithRelations>(
        `/api/budgets/${budgetId}/items/${itemId}`,
        input,
      )
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

export function useDeleteBudgetItem(budgetId: string, month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.delete<{ id: string }>(
        `/api/budgets/${budgetId}/items/${itemId}`,
      )
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

export function useCopyBudget(budgetId: string, month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CopyBudgetInput) => {
      const res = await api.post<BudgetWithItems>(
        `/api/budgets/${budgetId}/copy`,
        input,
      )
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

// Derived helpers
export function calcSpent(item: BudgetItemWithRelations): number {
  return item.transactions.reduce((sum, t) => sum + t.amount, 0)
}

export function calcBudgetSummary(items: BudgetItemWithRelations[]) {
  const totalIncome = items
    .filter((i) => i.category.type === 'income')
    .reduce((s, i) => s + i.plannedAmount, 0)

  const totalPlanned = items
    .filter((i) => i.category.type === 'expense')
    .reduce((s, i) => s + i.plannedAmount, 0)

  const totalSpent = items
    .filter((i) => i.category.type === 'expense')
    .reduce((s, i) => s + calcSpent(i), 0)

  return { totalIncome, totalPlanned, totalSpent, leftToBudget: totalIncome - totalPlanned }
}
