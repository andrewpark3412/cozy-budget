import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Debt, DebtPayment } from '@cozy-budget/shared'

export function useDebts() {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const res = await api.get<Debt[]>('/api/debts')
      return res.data ?? []
    },
  })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name: string
      originalBalance: number
      currentBalance: number
      interestRate: number
      minimumPayment: number
    }) => api.post<Debt>('/api/debts', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}

export function useUpdateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string
      name?: string
      currentBalance?: number
      interestRate?: number
      minimumPayment?: number
    }) => api.patch<Debt>(`/api/debts/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}

export function useDeleteDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/debts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}

export function useDebtPayments(debtId: string | null) {
  return useQuery({
    queryKey: ['debt-payments', debtId],
    queryFn: async () => {
      const res = await api.get<DebtPayment[]>(`/api/debts/${debtId}/payments`)
      return res.data ?? []
    },
    enabled: !!debtId,
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount, paymentDate }: { id: string; amount: number; paymentDate: string }) =>
      api.post<Debt>(`/api/debts/${id}/payments`, { amount, paymentDate }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['debt-payments', variables.id] })
    },
  })
}

export function useReorderDebts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.post('/api/debts/reorder', { orderedIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}
