import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { centsToDollars, dollarsToCents, formatCurrency, isValidAmountInput } from '@/lib/formatters'
import type { BudgetItemWithRelations } from '@/hooks/useBudget'
import { calcSpent } from '@/hooks/useBudget'

interface Props {
  item: BudgetItemWithRelations
  onUpdateAmount: (itemId: string, cents: number) => Promise<void>
  onDelete: (itemId: string) => void
  onOpenTransactions: (item: BudgetItemWithRelations) => void
}

const BudgetItemRow = ({ item, onUpdateAmount, onDelete, onOpenTransactions }: Props) => {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const spent = calcSpent(item)
  const pct = item.plannedAmount > 0 ? Math.min((spent / item.plannedAmount) * 100, 100) : 0
  const isWarning = item.plannedAmount > 0 && spent / item.plannedAmount >= 0.9
  const isDanger = spent > item.plannedAmount

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEditing = () => {
    setInputVal(centsToDollars(item.plannedAmount))
    setEditing(true)
  }

  const commitEdit = async () => {
    if (isValidAmountInput(inputVal, 0)) {
      const cents = dollarsToCents(inputVal)
      if (cents !== item.plannedAmount) {
        await onUpdateAmount(item.id, cents)
      }
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
      {/* Category name — click to open transaction drawer */}
      <button
        type="button"
        onClick={() => onOpenTransactions(item)}
        className="flex-1 truncate text-left text-sm text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={`View transactions for ${item.category.name}`}
      >
        {item.category.name}
      </button>

      {/* Spent */}
      <span
        className={cn(
          'text-sm tabular-nums',
          isDanger ? 'text-danger font-semibold' : 'text-muted-foreground',
        )}
      >
        {formatCurrency(spent)}
      </span>

      {/* Separator */}
      <span className="text-muted-foreground/40 text-sm">/</span>

      {/* Planned — inline editable */}
      {editing ? (
        <Input
          ref={inputRef}
          type="number"
          min="0"
          step="0.01"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="h-7 w-24 px-2 text-right text-sm tabular-nums"
          aria-label={`Planned amount for ${item.category.name}`}
        />
      ) : (
        <button
          onClick={startEditing}
          className="w-24 rounded px-2 py-0.5 text-right text-sm font-medium tabular-nums text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Edit planned amount for ${item.category.name}: ${formatCurrency(item.plannedAmount)}`}
        >
          {formatCurrency(item.plannedAmount)}
        </button>
      )}

      {/* Progress bar */}
      <div className="hidden w-20 md:block">
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isDanger ? 'bg-danger' : isWarning ? 'bg-accent' : 'bg-success',
            )}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Status badge */}
      {isDanger && (
        <span
          className="hidden shrink-0 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger md:block"
          aria-label="Over budget"
        >
          OVER
        </span>
      )}
      {isWarning && !isDanger && (
        <span
          className="hidden shrink-0 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent md:block"
          aria-label="Nearing budget limit"
        >
          90%
        </span>
      )}

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-danger"
        onClick={() => onDelete(item.id)}
        aria-label={`Remove ${item.category.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default BudgetItemRow
