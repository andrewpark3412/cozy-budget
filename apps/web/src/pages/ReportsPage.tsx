import React, { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
const ReportsCharts = React.lazy(() => import('@/components/reports/ReportsCharts'))
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { TrendingDown, TrendingUp, Tag, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/formatters'

// ---- types ----
interface CategoryBreakdown {
  name: string
  planned: number
  spent: number
}

interface MonthReport {
  month: number
  year: number
  label: string
  totalIncome: number
  totalPlanned: number
  totalSpent: number
  categoryBreakdown: CategoryBreakdown[]
}

// ---- colours ----
// (moved into lazy-loaded charts component)

// Charts are lazy-loaded in `ReportsCharts` to keep the main bundle small.

// ---- derived stats ----
const computeSummary = (reports: MonthReport[]) => {
  if (!reports.length) return null
  const withSpend = reports.filter((r) => r.totalSpent > 0)
  const avgIncome = Math.round(reports.reduce((s, r) => s + r.totalIncome, 0) / reports.length)
  const avgSpend = withSpend.length
    ? Math.round(withSpend.reduce((s, r) => s + r.totalSpent, 0) / withSpend.length)
    : 0

  // aggregate category totals across all months
  const catMap = new Map<string, number>()
  for (const r of reports) {
    for (const c of r.categoryBreakdown) {
      catMap.set(c.name, (catMap.get(c.name) ?? 0) + c.spent)
    }
  }
  let topCategory = ''
  let topAmount = 0
  catMap.forEach((amt, name) => {
    if (amt > topAmount) { topAmount = amt; topCategory = name }
  })

  return { avgIncome, avgSpend, topCategory, topAmount }
}

// ---- main page ----
const ReportsPage = () => {
  const [windowMonths, setWindowMonths] = useState(6)
  const [selectedMonth, setSelectedMonth] = useState<MonthReport | null>(null)

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['reports-monthly', windowMonths],
    queryFn: async () => {
      const res = await api.get<MonthReport[]>(`/api/reports/monthly?months=${windowMonths}`)
      return res.data ?? []
    },
  })

  const barData = reports?.map((r) => ({
    name: r.label,
    Income: r.totalIncome,
    Planned: r.totalPlanned,
    Spent: r.totalSpent,
    _raw: r,
  })) ?? []

  const displayMonth = selectedMonth ?? reports?.[reports.length - 1]

  const pieData = displayMonth?.categoryBreakdown
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent) ?? []

  // Budget vs actual data for horizontal bar chart (sorted by overspend desc)
  const bvaData = displayMonth?.categoryBreakdown
    .filter((c) => c.planned > 0 || c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10) ?? []

  const summary = reports ? computeSummary(reports) : null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* header + window selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Spending trends and category breakdown</p>
        </div>
        <div className="flex gap-1.5">
          {[3, 6, 12].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={windowMonths === n ? 'default' : 'outline'}
              className={windowMonths === n ? 'bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white' : ''}
              onClick={() => { setWindowMonths(n); setSelectedMonth(null) }}
            >
              {n}mo
            </Button>
          ))}
        </div>
      </div>

      {/* error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Failed to load report data. Please refresh the page.
        </div>
      )}

      {/* loading skeletons */}
      {!isError && isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {/* no data */}
      {!isError && !isLoading && reports?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium text-foreground">No data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add transactions to your budget to see spending trends here.
          </p>
        </div>
      )}

      {/* ---- summary cards ---- */}
      {!isError && !isLoading && summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1.5 text-[#5A8C6A]" />
            <p className="text-xs text-muted-foreground">Avg Monthly Income</p>
            <p className="font-semibold text-[#5A8C6A] mt-0.5">{formatCurrency(summary.avgIncome)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1.5 text-[#D4845A]" />
            <p className="text-xs text-muted-foreground">Avg Monthly Spend</p>
            <p className="font-semibold text-[#D4845A] mt-0.5">{formatCurrency(summary.avgSpend)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm text-center">
            <Tag className="h-5 w-5 mx-auto mb-1.5 text-[#7C9A7E]" />
            <p className="text-xs text-muted-foreground">Top Expense Category</p>
            <p className="font-semibold text-foreground mt-0.5 truncate">
              {summary.topCategory || '—'}
            </p>
            {summary.topAmount > 0 && (
              <p className="text-xs text-muted-foreground">{formatCurrency(summary.topAmount)}</p>
            )}
          </div>
        </div>
      )}

      {/* Charts are lazy-loaded to keep the main bundle small. */}
      {!isError && !isLoading && barData.length > 0 && (
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          }
        >
          <ReportsCharts
            barData={barData}
            setSelectedMonth={setSelectedMonth}
            displayMonth={displayMonth ?? null}
            bvaData={bvaData}
            pieData={pieData}
            selectedMonth={selectedMonth}
          />
        </Suspense>
      )}
    </div>
  )
}

export default ReportsPage
