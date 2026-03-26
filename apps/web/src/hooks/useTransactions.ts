import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '@cozy-budget/shared'

// Transactions are embedded in the budget query (via budget.items[].transactions).
// These mutations invalidate the budget query so everything re-fetches in one go.
function budgetKey(month: number, year: number) {
  return ['budget', month, year] as const
}

export function useAddTransaction(month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await api.post<Transaction>('/api/transactions', input)
      if (res.error) throw new Error(res.error)
      return res.data as Transaction
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

export function useUpdateTransaction(month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput & { id: string }) => {
      const res = await api.patch<Transaction>(`/api/transactions/${id}`, input)
      if (res.error) throw new Error(res.error)
      return res.data as Transaction
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}

export function useDeleteTransaction(month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ id: string }>(`/api/transactions/${id}`)
      if (res.error) throw new Error(res.error)
      return res.data as { id: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetKey(month, year) }),
  })
}
