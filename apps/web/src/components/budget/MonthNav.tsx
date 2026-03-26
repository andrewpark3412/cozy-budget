import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { formatMonthYear } from '@/lib/formatters'

const MonthNav = () => {
  const { selectedMonth, selectedYear, goToPrevMonth, goToNextMonth } = useBudgetStore()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevMonth}
        aria-label="Previous month"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-[140px] text-center text-sm font-medium text-foreground">
        {formatMonthYear(selectedMonth, selectedYear)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        aria-label="Next month"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default MonthNav
