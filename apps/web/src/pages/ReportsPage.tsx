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
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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

// ---- currency tooltip ----
const CurrencyTooltip = ({ active, payload, label }: {
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

// ---- main page ----
const ReportsPage = () => {
  const [windowMonths, setWindowMonths] = useState(6)
  const [selectedMonth, setSelectedMonth] = useState<MonthReport | null>(null)

  const { data: reports, isLoading } = useQuery({
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

  const pieData = (selectedMonth ?? reports?.[reports.length - 1])?.categoryBreakdown
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent) ?? []

  const displayMonth = selectedMonth ?? reports?.[reports.length - 1]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* header */}
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
              onClick={() => setWindowMonths(n)}
            >
              {n}mo
            </Button>
          ))}
        </div>
      </div>

      {/* loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {/* no data */}
      {!isLoading && reports?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium text-foreground">No data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add transactions to your budget to see spending trends here.
          </p>
        </div>
      )}

      {/* monthly bar chart */}
      {!isLoading && barData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            Monthly Overview
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Click a month to see category breakdown</p>
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

      {/* category pie for selected month */}
      {!isLoading && displayMonth && (
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
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${Math.round(percent * 100)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
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

          {/* summary stats */}
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
