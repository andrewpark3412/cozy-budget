import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/requireAuth'
import { db } from '@/db'
import { budgets, budgetItems } from '@/db/schema/budgets'
import { transactions } from '@/db/schema/transactions'
import { categories } from '@/db/schema/categories'
import { eq, and, desc, gte } from 'drizzle-orm'

// Returns last N months of spending vs. planned data
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const url = new URL(req.url)
  const months = Math.min(12, parseInt(url.searchParams.get('months') ?? '6', 10))

  // Get the last N budgets for this user
  const userBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, auth.userId))
    .orderBy(desc(budgets.year), desc(budgets.month))
    .limit(months)

  const result = await Promise.all(
    userBudgets.map(async (budget) => {
      // Get all budget items with category and transactions
      const items = await db
        .select({
          id: budgetItems.id,
          categoryId: budgetItems.categoryId,
          plannedAmount: budgetItems.plannedAmount,
          categoryName: categories.name,
          categoryType: categories.type,
        })
        .from(budgetItems)
        .leftJoin(categories, eq(budgetItems.categoryId, categories.id))
        .where(eq(budgetItems.budgetId, budget.id))

      const txRows = await db
        .select({ budgetItemId: transactions.budgetItemId, amount: transactions.amount })
        .from(transactions)
        .where(
          and(
            gte(transactions.budgetItemId, '0'), // all
            eq(budgetItems.budgetId, budget.id)
          )
        )
        .innerJoin(budgetItems, eq(transactions.budgetItemId, budgetItems.id))

      // Sum spent per item
      const spentMap = new Map<string, number>()
      for (const tx of txRows) {
        spentMap.set(tx.budgetItemId, (spentMap.get(tx.budgetItemId) ?? 0) + tx.amount)
      }

      let totalIncome = 0
      let totalPlanned = 0
      let totalSpent = 0
      const categoryBreakdown: { name: string; planned: number; spent: number }[] = []

      for (const item of items) {
        const spent = spentMap.get(item.id) ?? 0
        if (item.categoryType === 'income') {
          totalIncome += item.plannedAmount
        } else {
          totalPlanned += item.plannedAmount
          totalSpent += spent
          categoryBreakdown.push({
            name: item.categoryName ?? 'Unknown',
            planned: item.plannedAmount,
            spent,
          })
        }
      }

      return {
        month: budget.month,
        year: budget.year,
        label: new Date(budget.year, budget.month - 1).toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        totalIncome,
        totalPlanned,
        totalSpent,
        categoryBreakdown,
      }
    })
  )

  // Return sorted oldest → newest for chart rendering
  result.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)

  return NextResponse.json({ data: result, error: null })
}
