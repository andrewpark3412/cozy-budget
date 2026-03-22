export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  userId: string | null // null = predefined system category
  name: string
  type: CategoryType
  isSystem: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
