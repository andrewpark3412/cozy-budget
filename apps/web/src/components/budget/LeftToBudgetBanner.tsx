import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  totalIncome: number
  totalPlanned: number
  leftToBudget: number
}

const LeftToBudgetBanner = ({ totalIncome, totalPlanned, leftToBudget }: Props) => {
  const isOver = leftToBudget < 0
  const isBalanced = leftToBudget === 0

  return (
    <div
      className={cn(
        'rounded-2xl p-4 md:p-5',
        isOver
          ? 'bg-danger/10 text-danger'
          : isBalanced
            ? 'bg-success/10 text-success'
            : 'bg-primary/10 text-primary',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">
            Left to Budget
          </p>
          <p className="text-2xl font-bold">{formatCurrency(Math.abs(leftToBudget))}</p>
          {isOver && (
            <p className="text-xs opacity-80">Over budget by {formatCurrency(Math.abs(leftToBudget))}</p>
          )}
        </div>

        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs opacity-70">Income</p>
            <p className="text-sm font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Planned</p>
            <p className="text-sm font-semibold">{formatCurrency(totalPlanned)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftToBudgetBanner
