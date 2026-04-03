import React from 'react'
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
import { formatCurrency } from '@/lib/formatters'

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

type Props = {
  barData: any[]
  setSelectedMonth: (m: MonthReport | null) => void
  displayMonth: MonthReport | null
  bvaData: any[]
  pieData: CategoryBreakdown[]
  selectedMonth: MonthReport | null
}

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

const ReportsCharts: React.FC<Props> = ({
  barData,
  setSelectedMonth,
  displayMonth,
  bvaData,
  pieData,
}) => {
  return (
    <>
      {/* Monthly Overview */}
      {barData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
            Monthly Overview
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Click a month bar to drill into its category breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barData}
              onClick={(state: any) => {
                if (state?.activePayload?.[0]) {
                  setSelectedMonth((state.activePayload[0].payload as any)._raw)
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

      {/* Spending trend */}
      {barData.length > 1 && (
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

      {/* Budget vs Actual (vertical bars) */}
      {displayMonth && bvaData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {displayMonth.label} — Budget vs. Actual
            </h2>
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

      {/* Pie breakdown */}
      {displayMonth && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No spending recorded for this month.</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="spent" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={[ '#7C9A7E', '#D4845A', '#5A8C6A', '#C0615A', '#8B7355', '#6B8FAB', '#A0826D', '#7A9E7E', '#D4956A', '#6A7C5A' ][index % 10]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-full md:w-auto shrink-0 space-y-1.5 text-sm min-w-[200px]">
                {pieData.slice(0, 8).map((c, idx) => (
                  <div key={c.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: [ '#7C9A7E', '#D4845A', '#5A8C6A', '#C0615A', '#8B7355', '#6B8FAB', '#A0826D', '#7A9E7E', '#D4956A', '#6A7C5A' ][idx % 10] }} />
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
              <p className="font-semibold text-[#5A8C6A]">{formatCurrency(displayMonth?.totalIncome ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Planned</p>
              <p className="font-semibold text-[#7C9A7E]">{formatCurrency(displayMonth?.totalPlanned ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Spent</p>
              <p className={`font-semibold ${((displayMonth?.totalSpent ?? 0) > (displayMonth?.totalPlanned ?? 0)) ? 'text-[#C0615A]' : 'text-[#D4845A]'}`}>
                {formatCurrency(displayMonth?.totalSpent ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportsCharts
