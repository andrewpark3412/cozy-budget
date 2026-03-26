import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { RecurringItem, Category } from '@cozy-budget/shared'
import type { CreateRecurringItemInput, UpdateRecurringItemInput } from '@cozy-budget/shared'

export interface RecurringItemWithCategory extends RecurringItem {
  category: Category
}

const QUERY_KEY = ['recurring-items'] as const

export function useRecurringItems() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<RecurringItemWithCategory[]>('/api/recurring-items')
      if (res.error) throw new Error(res.error)
      return res.data as RecurringItemWithCategory[]
    },
  })
}

export function useCreateRecurringItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRecurringItemInput) => {
      const res = await api.post<RecurringItemWithCategory>('/api/recurring-items', input)
      if (res.error) throw new Error(res.error)
      return res.data as RecurringItemWithCategory
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateRecurringItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateRecurringItemInput & { id: string }) => {
      const res = await api.patch<RecurringItemWithCategory>(
        `/api/recurring-items/${id}`,
        input,
      )
      if (res.error) throw new Error(res.error)
      return res.data as RecurringItemWithCategory
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteRecurringItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ id: string }>(`/api/recurring-items/${id}`)
      if (res.error) throw new Error(res.error)
      return res.data as { id: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
