import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { categories } from './categories'

export const recurringItems = pgTable('recurring_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  amount: integer('amount').notNull(), // cents
  dayOfMonth: integer('day_of_month').notNull(), // 1–31
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const recurringItemsRelations = relations(recurringItems, ({ one }) => ({
  user: one(users, { fields: [recurringItems.userId], references: [users.id] }),
  category: one(categories, { fields: [recurringItems.categoryId], references: [categories.id] }),
}))
