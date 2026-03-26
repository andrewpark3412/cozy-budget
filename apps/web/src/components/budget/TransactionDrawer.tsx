import { useState } from 'react'
import { Trash2, Zap } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAddTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import AddTransactionForm from './AddTransactionForm'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { BudgetItemWithRelations } from '@/hooks/useBudget'
import { calcSpent } from '@/hooks/useBudget'
import { cn } from '@/lib/utils'

interface Props {
  item: BudgetItemWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  month: number
  year: number
}

const TransactionDrawer = ({ item, open, onOpenChange, month, year }: Props) => {
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const addTx = useAddTransaction(month, year)
  const deleteTx = useDeleteTransaction(month, year)

  if (!item) return null

  const spent = calcSpent(item)
  const pct = item.plannedAmount > 0 ? (spent / item.plannedAmount) * 100 : 0
  const isDanger = spent > item.plannedAmount

  const handleAdd = async (amountCents: number, date: string, note: string | null) => {
    await addTx.mutateAsync({
      budgetItemId: item.id,
      amount: amountCents,
      date,
      note,
    })
    toast({ title: 'Transaction added' })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteTx.mutateAsync(deleteId, {
      onError: (err) => {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete',
          variant: 'destructive',
        })
      },
    })
    setDeleteId(null)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader className="pb-4">
            <SheetTitle>{item.category.name}</SheetTitle>
            <SheetDescription asChild>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1 text-sm">
                  <span
                    className={cn(
                      'font-semibold',
                      isDanger ? 'text-danger' : 'text-foreground',
                    )}
                  >
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-muted-foreground">
                    spent of {formatCurrency(item.plannedAmount)} planned
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isDanger
                        ? 'bg-danger'
                        : pct >= 90
                          ? 'bg-accent'
                          : 'bg-success',
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Add transaction form */}
          <div className="py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Add Transaction
            </p>
            <AddTransactionForm onAdd={handleAdd} />
          </div>

          <Separator />

          {/* Transaction history */}
          <div className="flex-1 overflow-y-auto py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              History ({item.transactions.length})
            </p>

            {item.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <ul className="space-y-1">
                {[...item.transactions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((tx) => (
                    <li
                      key={tx.id}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm text-foreground">
                            {tx.note || '—'}
                          </span>
                          {tx.isAutoGenerated && (
                            <span
                              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                              title="Auto-generated from recurring item"
                            >
                              <Zap className="h-2.5 w-2.5" />
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                      </div>

                      <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(tx.amount)}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-danger"
                        onClick={() => setDeleteId(tx.id)}
                        aria-label={`Delete transaction${tx.note ? ` "${tx.note}"` : ''}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this transaction and update your spending totals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger hover:bg-danger/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default TransactionDrawer
