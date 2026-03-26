import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SavingsGoal } from '@cozy-budget/shared'

export function useSavingsGoals() {
  return useQuery({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      const res = await api.get<SavingsGoal[]>('/api/savings-goals')
      return res.data ?? []
    },
  })
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; targetAmount: number; targetDate?: string | null }) =>
      api.post<SavingsGoal>('/api/savings-goals', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string
      name?: string
      targetAmount?: number
      targetDate?: string | null
    }) => api.patch<SavingsGoal>(`/api/savings-goals/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/savings-goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })
}

export function useContributeToGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount, date }: { id: string; amount: number; date: string }) =>
      api.post<SavingsGoal>(`/api/savings-goals/${id}/contribute`, { amount, date }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })
}
