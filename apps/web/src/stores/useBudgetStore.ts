import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BudgetStore {
  selectedMonth: number
  selectedYear: number
  setMonth: (month: number, year: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
}

const now = new Date()

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      selectedMonth: now.getMonth() + 1,
      selectedYear: now.getFullYear(),

      setMonth: (month, year) => set({ selectedMonth: month, selectedYear: year }),

      goToPrevMonth: () => {
        const { selectedMonth, selectedYear } = get()
        if (selectedMonth === 1) {
          set({ selectedMonth: 12, selectedYear: selectedYear - 1 })
        } else {
          set({ selectedMonth: selectedMonth - 1 })
        }
      },

      goToNextMonth: () => {
        const { selectedMonth, selectedYear } = get()
        if (selectedMonth === 12) {
          set({ selectedMonth: 1, selectedYear: selectedYear + 1 })
        } else {
          set({ selectedMonth: selectedMonth + 1 })
        }
      },
    }),
    { name: 'cozy-budget-month' },
  ),
)
