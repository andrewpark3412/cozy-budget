import { useState, useRef, useEffect } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useBudgetStore } from '@/stores/useBudgetStore'
import {
  useBudget,
  useAddBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  useCopyBudget,
  calcBudgetSummary,
  calcSpent,
  type BudgetItemWithRelations,
} from '@/hooks/useBudget'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCategories } from '@/hooks/useCategories'
import MonthNav from '@/components/budget/MonthNav'
import LeftToBudgetBanner from '@/components/budget/LeftToBudgetBanner'
import CategorySection from '@/components/budget/CategorySection'
import AddBudgetItemDialog from '@/components/budget/AddBudgetItemDialog'
import CopyBudgetDialog from '@/components/budget/CopyBudgetDialog'
import TransactionDrawer from '@/components/budget/TransactionDrawer'

const BudgetPage = () => {
  const { selectedMonth, selectedYear } = useBudgetStore()
  const { toast } = useToast()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [drawerItem, setDrawerItem] = useState<BudgetItemWithRelations | null>(null)

  // Track spending state per item to fire alert toasts only once per threshold crossing
  const alertedItems = useRef<Map<string, 'warning' | 'danger'>>(new Map())

  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(
    selectedMonth,
    selectedYear,
  )
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories()

  const addItem = useAddBudgetItem(budget?.id ?? '', selectedMonth, selectedYear)
  const updateItem = useUpdateBudgetItem(budget?.id ?? '', selectedMonth, selectedYear)
  const deleteItem = useDeleteBudgetItem(budget?.id ?? '', selectedMonth, selectedYear)
  const copyBudget = useCopyBudget(budget?.id ?? '', selectedMonth, selectedYear)

  // Reconcile recurring items when a budget month loads or its line structure changes.
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!budget) return
    api
      .post<{ created: number }>(`/api/budgets/${budget.id}/apply-recurring`, {})
      .then((res) => {
        if (!res.error && res.data && res.data.created > 0) {
          queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth, selectedYear] })
        }
      })
      .catch(() => {
        // Non-critical — recurring apply errors should not break the UI
      })
  }, [budget?.id, budget?.items.length, selectedMonth, selectedYear, queryClient])

  if (budgetLoading || categoriesLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (budgetError || !budget) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-danger">Failed to load budget. Please try refreshing.</p>
      </div>
    )
  }

  const items = budget.items
  const incomeItems = items.filter((i) => i.category.type === 'income')
  const expenseItems = items.filter((i) => i.category.type === 'expense')

  const usedCategoryIds = new Set(items.map((i) => i.categoryId))
  const availableCategories = allCategories.filter((c) => !usedCategoryIds.has(c.id))

  const { totalIncome, totalPlanned, leftToBudget } = calcBudgetSummary(items)

  const handleUpdateAmount = async (itemId: string, cents: number) => {
    try {
      await updateItem.mutateAsync({ itemId, plannedAmount: cents })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update amount',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteItem = (itemId: string) => {
    deleteItem.mutate(itemId, {
      onError: (err) => {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to remove item',
          variant: 'destructive',
        })
      },
    })
  }

  const handleAddItem = async (categoryId: string, plannedAmountCents: number) => {
    await addItem.mutateAsync({ categoryId, plannedAmount: plannedAmountCents })
    toast({ title: 'Item added', description: 'Budget item has been added.' })
  }

  const handleCopy = async (sourceMonth: number, sourceYear: number) => {
    await copyBudget.mutateAsync({ sourceMonth, sourceYear })
  }

  // Fire budget alert toasts when an item crosses 90% or 100% thresholds.
  // Only fire once per crossing (tracked in alertedItems ref).
  const checkAlerts = (updatedItem: BudgetItemWithRelations) => {
    const spent = calcSpent(updatedItem)
    const pct = updatedItem.plannedAmount > 0 ? spent / updatedItem.plannedAmount : 0
    const prev = alertedItems.current.get(updatedItem.id)

    if (pct > 1 && prev !== 'danger') {
      alertedItems.current.set(updatedItem.id, 'danger')
      toast({
        title: `🚨 Over budget: ${updatedItem.category.name}`,
        description: 'You have exceeded your planned amount for this category.',
        variant: 'destructive',
      })
    } else if (pct >= 0.9 && pct <= 1 && prev !== 'warning' && prev !== 'danger') {
      alertedItems.current.set(updatedItem.id, 'warning')
      toast({
        title: `⚠️ Nearing limit: ${updatedItem.category.name}`,
        description: 'You have used 90% of your planned amount.',
      })
    } else if (pct < 0.9) {
      alertedItems.current.delete(updatedItem.id)
    }
  }

  const handleOpenTransactions = (item: BudgetItemWithRelations) => {
    setDrawerItem(item)
  }

  // Keep drawerItem in sync with live budget data (so the drawer reflects new transactions)
  const liveDrawerItem = drawerItem
    ? (budget?.items.find((i) => i.id === drawerItem.id) ?? drawerItem)
    : null

  // Check alerts whenever budget data updates
  budget?.items.forEach(checkAlerts)

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <MonthNav />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setCopyDialogOpen(true)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Month
        </Button>
      </div>

      {/* Summary banner */}
      <LeftToBudgetBanner
        totalIncome={totalIncome}
        totalPlanned={totalPlanned}
        leftToBudget={leftToBudget}
      />

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No budget items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add income and expense items below, or copy from a previous month.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Income
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Expense
            </Button>
          </div>
        </div>
      )}

      {/* Income section */}
      {items.length > 0 && (
        <CategorySection
          title="Income"
          items={incomeItems}
          onUpdateAmount={handleUpdateAmount}
          onDeleteItem={handleDeleteItem}
          onAddItem={() => setAddDialogOpen(true)}
          onOpenTransactions={handleOpenTransactions}
        />
      )}

      {/* Expense section */}
      {items.length > 0 && (
        <CategorySection
          title="Expenses"
          items={expenseItems}
          onUpdateAmount={handleUpdateAmount}
          onDeleteItem={handleDeleteItem}
          onAddItem={() => setAddDialogOpen(true)}
          onOpenTransactions={handleOpenTransactions}
        />
      )}

      {/* Dialogs */}
      <AddBudgetItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        availableCategories={availableCategories}
        onAdd={handleAddItem}
      />

      <CopyBudgetDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onCopy={handleCopy}
      />

      <TransactionDrawer
        item={liveDrawerItem}
        open={!!drawerItem}
        onOpenChange={(open) => { if (!open) setDrawerItem(null) }}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  )
}

export default BudgetPage
