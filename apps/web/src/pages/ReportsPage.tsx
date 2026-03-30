import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
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
const PIE_COLORS = [
  '#7C9A7E', '#D4845A', '#5A8C6A', '#C0615A', '#8B7355',
  '#6B8FAB', '#A0826D', '#7A9E7E', '#D4956A', '#6A7C5A',
]

// ---- shared tooltip ----
const CurrencyTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

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

      {/* ---- monthly overview bar chart ---- */}
      {!isError && !isLoading && barData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
            Monthly Overview
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Click a month bar to drill into its category breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barData}
              onClick={(state) => {
                if (state?.activePayload?.[0]) {
                  setSelectedMonth((state.activePayload[0].payload as { _raw: MonthReport })._raw)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8C8479' }} />
              <YAxis
                tickFormatter={(v: number) => `$${Math.round(v / 100)}`}
                tick={{ fontSize: 11, fill: '#8C8479' }}
                width={55}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income" fill="#5A8C6A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Planned" fill="#7C9A7E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Spent" fill="#D4845A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- spending trend line chart ---- */}
      {!isError && !isLoading && barData.length > 1 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8C8479' }} />
              <YAxis
                tickFormatter={(v: number) => `$${Math.round(v / 100)}`}
                tick={{ fontSize: 11, fill: '#8C8479' }}
                width={55}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="Income"
                stroke="#5A8C6A"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Spent"
                stroke="#D4845A"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- budget vs actual (horizontal bar) ---- */}
      {!isError && !isLoading && displayMonth && bvaData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {displayMonth.label} — Budget vs. Actual
            </h2>
            {selectedMonth && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setSelectedMonth(null)}
              >
                Reset to latest
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">Planned (green) vs. spent (amber) per category</p>
          <ResponsiveContainer width="100%" height={Math.max(180, bvaData.length * 36)}>
            <BarChart layout="vertical" data={bvaData} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `$${Math.round(v / 100)}`}
                tick={{ fontSize: 10, fill: '#8C8479' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#8C8479' }}
                width={90}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="planned" name="Planned" fill="#7C9A7E" radius={[0, 3, 3, 0]} barSize={10} />
              <Bar dataKey="spent" name="Spent" fill="#D4845A" radius={[0, 3, 3, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ---- category pie / breakdown ---- */}
      {!isError && !isLoading && displayMonth && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {displayMonth.label} — Category Breakdown
            </h2>
            {selectedMonth && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setSelectedMonth(null)}
              >
                Reset to latest
              </Button>
            )}
          </div>

          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No spending recorded for this month.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="spent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>

              {/* legend table */}
              <div className="w-full md:w-auto shrink-0 space-y-1.5 text-sm min-w-[200px]">
                {pieData.slice(0, 8).map((c, idx) => (
                  <div key={c.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="truncate text-muted-foreground">{c.name}</span>
                    </div>
                    <span className="font-medium tabular-nums">{formatCurrency(c.spent)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* month summary stats */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Income</p>
              <p className="font-semibold text-[#5A8C6A]">{formatCurrency(displayMonth.totalIncome)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Planned</p>
              <p className="font-semibold text-[#7C9A7E]">{formatCurrency(displayMonth.totalPlanned)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Spent</p>
              <p
                className={`font-semibold ${
                  displayMonth.totalSpent > displayMonth.totalPlanned
                    ? 'text-[#C0615A]'
                    : 'text-[#D4845A]'
                }`}
              >
                {formatCurrency(displayMonth.totalSpent)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
