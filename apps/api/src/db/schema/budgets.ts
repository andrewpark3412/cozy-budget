import { pgTable, text, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { categories } from './categories'
import { transactions } from './transactions'

export const budgets = pgTable(
  'budgets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    month: integer('month').notNull(), // 1–12
    year: integer('year').notNull(),
    recurringApplied: integer('recurring_applied').notNull().default(0), // 0 = not yet, 1 = applied
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('budgets_user_month_year_unique').on(t.userId, t.month, t.year)],
)

export const budgetItems = pgTable('budget_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  budgetId: text('budget_id')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  plannedAmount: integer('planned_amount').notNull().default(0), // cents
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const budgetsRelations = relations(budgets, ({ many }) => ({
  items: many(budgetItems),
}))

export const budgetItemsRelations = relations(budgetItems, ({ one, many }) => ({
  budget: one(budgets, { fields: [budgetItems.budgetId], references: [budgets.id] }),
  category: one(categories, { fields: [budgetItems.categoryId], references: [categories.id] }),
  transactions: many(transactions),
}))
