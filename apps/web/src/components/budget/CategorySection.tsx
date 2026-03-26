import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters'
import BudgetItemRow from './BudgetItemRow'
import type { BudgetItemWithRelations } from '@/hooks/useBudget'
import { calcSpent } from '@/hooks/useBudget'

interface Props {
  title: string
  items: BudgetItemWithRelations[]
  onUpdateAmount: (itemId: string, cents: number) => Promise<void>
  onDeleteItem: (itemId: string) => void
  onAddItem: () => void
  onOpenTransactions: (item: BudgetItemWithRelations) => void
  defaultExpanded?: boolean
}

const CategorySection = ({
  title,
  items,
  onUpdateAmount,
  onDeleteItem,
  onAddItem,
  onOpenTransactions,
  defaultExpanded = true,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const totalPlanned = items.reduce((s, i) => s + i.plannedAmount, 0)
  const totalSpent = items.reduce((s, i) => s + calcSpent(i), 0)

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-2xl px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        aria-expanded={expanded}
      >
        <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(totalSpent)} / {formatCurrency(totalPlanned)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No items yet. Add one below.
            </p>
          ) : (
            <div className="divide-y divide-border/50 px-1 py-1">
              {items.map((item) => (
                <BudgetItemRow
                  key={item.id}
                  item={item}
                  onUpdateAmount={onUpdateAmount}
                  onDelete={onDeleteItem}
                  onOpenTransactions={onOpenTransactions}
                />
              ))}
            </div>
          )}

          <div className="border-t border-border/50 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddItem}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default CategorySection
