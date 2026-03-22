# Cozy Budget — Build Checklist

A phased development plan. Work through phases in order — each builds on the last.
Check off items as they are completed.

---

## Phase 1 — Project Foundation

### Monorepo & Tooling
- [ ] Initialize repo with pnpm workspaces + Turborepo
- [ ] Create `apps/web` (React + Vite), `apps/api` (Next.js), `packages/shared`
- [ ] Configure root `tsconfig.json` with path aliases; extend in each app
- [ ] Configure ESLint + Prettier with shared config in `packages/eslint-config`
- [ ] Add `.gitignore`, `.nvmrc` / `.node-version`

### Frontend Bootstrap (`apps/web`)
- [ ] Scaffold Vite + React 18 + TypeScript app
- [ ] Install and configure Tailwind CSS v3
- [ ] Install and initialize shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Apply "Cozy" color tokens to `tailwind.config.ts` and `globals.css` CSS variables
- [ ] Install React Router v6, TanStack Query v5, Zustand, React Hook Form, Zod, Lucide React, Recharts
- [ ] Set up `@/` path alias pointing to `src/`
- [ ] Create base layout skeleton (shell with sidebar/bottom nav placeholder)

### Backend Bootstrap (`apps/api`)
- [ ] Scaffold Next.js 14+ app (App Router, TypeScript, no default pages)
- [ ] Install Drizzle ORM, drizzle-kit, postgres driver
- [ ] Install Zod, BetterAuth
- [ ] Configure `@/` path alias pointing to `src/`
- [ ] Create `src/db/index.ts` Drizzle client singleton (reads `DATABASE_URL` env var)

### Shared Package (`packages/shared`)
- [ ] Initialize as a TypeScript package (`@cozy-budget/shared`)
- [ ] Wire up as a workspace dependency in `apps/web` and `apps/api`
- [ ] Create folder structure: `schemas/`, `types/`, `constants/`

### Local Infrastructure
- [ ] Create `docker-compose.yml` with a `postgres` service (image, port 5432, named volume)
- [ ] Create `Makefile` with targets:
  - `install`  — `pnpm install`
  - `dev`      — start Docker Postgres + `turbo run dev`
  - `db`       — `docker-compose up -d postgres`
  - `db-stop`  — `docker-compose down`
  - `db-reset` — `docker-compose down -v && docker-compose up -d postgres`
  - `migrate`  — `drizzle-kit migrate`
  - `seed`     — run category seed script
- [ ] Create `apps/api/.env.example` and `apps/web/.env.example` with all required var names

---

## Phase 2 — Database Schema & Migrations

### Schema Design (Drizzle ORM)
- [ ] `users` + `sessions` — delegate to BetterAuth; confirm generated tables match
- [ ] `budgets` table — `id`, `user_id`, `month` (1–12), `year`, `created_at`, `updated_at`
- [ ] `categories` table — `id`, `user_id` (null = predefined), `name`, `type` (income/expense), `is_system`, `sort_order`, `created_at`, `updated_at`
- [ ] `budget_items` table — `id`, `budget_id`, `category_id`, `planned_amount`, `created_at`, `updated_at`
- [ ] `transactions` table — `id`, `budget_item_id`, `amount`, `date`, `note`, `is_auto_generated`, `recurring_item_id` (nullable), `created_at`, `updated_at`
- [ ] `recurring_items` table — `id`, `user_id`, `budget_item_template` reference, `amount`, `day_of_month`, `name`, `is_active`, `created_at`, `updated_at`
- [ ] `savings_goals` table — `id`, `user_id`, `name`, `target_amount`, `current_amount`, `target_date` (nullable), `is_complete`, `created_at`, `updated_at`
- [ ] `debts` table — `id`, `user_id`, `name`, `original_balance`, `current_balance`, `interest_rate`, `minimum_payment`, `sort_order`, `created_at`, `updated_at`
- [ ] `debt_payments` table — `id`, `debt_id`, `amount`, `payment_date`, `created_at`

### Migrations & Seeding
- [ ] Run `drizzle-kit generate` to produce initial migration
- [ ] Run `drizzle-kit migrate` against local Docker Postgres and confirm success
- [ ] Write seed script (`apps/api/src/db/seed.ts`) to insert predefined categories:
  - **Income**: Paycheck, Other Income
  - **Giving**: Giving (system — cannot be deleted)
  - **Saving**: Emergency Fund, Retirement, Other Savings
  - **Housing**: Rent/Mortgage, HOA, Home Insurance, Property Tax, Repairs/Maintenance
  - **Transport**: Car Payment, Car Insurance, Gas, Parking, Car Maintenance
  - **Food**: Groceries, Dining Out, Coffee Shops
  - **Personal**: Clothing, Medical/Dental, Gym, Haircuts, Personal Care
  - **Lifestyle**: Subscriptions, Entertainment, Hobbies, Vacation
  - **Debt**: Credit Card, Student Loan, Other Debt
  - **Other**: Miscellaneous

---

## Phase 3 — Authentication

### BetterAuth Setup
- [ ] Configure BetterAuth in `apps/api/src/lib/auth.ts` (email/password provider, Postgres adapter)
- [ ] Mount BetterAuth handler at `apps/api/src/app/api/auth/[...all]/route.ts`
- [ ] Create `apps/api/src/middleware/requireAuth.ts` helper that extracts + validates session; returns `userId` or throws 401
- [ ] Confirm BetterAuth migrations (users, sessions, accounts tables) are generated and applied

### Frontend Auth
- [ ] Install BetterAuth client SDK in `apps/web`
- [ ] Create `src/lib/auth-client.ts` (BetterAuth client pointing to API base URL)
- [ ] Create Zustand `useAuthStore` for current user state
- [ ] Build `LoginPage` — email/password form, React Hook Form + Zod, error display
- [ ] Build `SignUpPage` — registration form with confirm password validation
- [ ] Create `ProtectedRoute` wrapper that redirects unauthenticated users to `/login`
- [ ] Set up React Router routes: `/login`, `/signup`, and all protected app routes
- [ ] Implement sign-out and session persistence (auto-fetch session on app load)

---

## Phase 4 — Budget Core

### API Routes
- [ ] `GET /api/budgets?month=&year=` — fetch (or create) user's budget for a given month/year
- [ ] `POST /api/budgets/:id/copy` — copy budget items from a source month/year to a new budget
- [ ] `GET /api/budgets/:id/items` — list all budget items for a budget
- [ ] `POST /api/budgets/:id/items` — add a budget item
- [ ] `PATCH /api/budgets/:id/items/:itemId` — update planned amount
- [ ] `DELETE /api/budgets/:id/items/:itemId` — remove a budget item
- [ ] `GET /api/categories` — list all categories (system + user's custom)
- [ ] `POST /api/categories` — create a custom category
- [ ] `PATCH /api/categories/:id` — rename a custom category
- [ ] `DELETE /api/categories/:id` — delete a custom category (not system categories)

### Frontend — Budget View
- [ ] Month/year navigation component (prev/next arrows + month label)
- [ ] Budget page: fetch budget for selected month, display grouped by category type
- [ ] Income section: list income budget items, show total planned income
- [ ] Expense section: categories collapsed/expanded, planned amount per item
- [ ] Inline editing: click a planned amount to edit it in-place
- [ ] Add budget item: click "+ Add Item" within a category
- [ ] Add new custom category button
- [ ] "Left to Budget" banner: total income − total planned expenses (green if ≥ 0, red if over)
- [ ] Copy from previous month: modal showing source month selector + confirm action
- [ ] Empty state for a brand-new month with no budget

---

## Phase 5 — Transaction Tracking

### API Routes
- [ ] `GET /api/budgets/:id/transactions` — all transactions for a budget (optionally filtered by item)
- [ ] `POST /api/transactions` — record a new transaction
- [ ] `PATCH /api/transactions/:id` — edit transaction amount, date, note
- [ ] `DELETE /api/transactions/:id` — delete a transaction

### Frontend — Transactions
- [ ] Budget item row: show spent amount vs. planned amount + progress bar
- [ ] Click a budget item to open a transaction drawer/sheet
- [ ] Transaction list in drawer: date, note, amount per entry
- [ ] "Add Transaction" form in drawer: amount, date, optional note
- [ ] Delete transaction with confirmation
- [ ] Category totals update reactively when transactions are added/removed

### Budget Alerts
- [ ] In the budget item row, show a ⚠️ warning badge when spending ≥ 90% of planned
- [ ] Trigger a warning toast notification at 90% threshold
- [ ] Show a 🚨 danger badge and red styling when spending > 100% of planned
- [ ] Trigger a danger toast notification when budget item is exceeded

---

## Phase 6 — Recurring Items (Auto-Deducting Expenses)

### API Routes
- [ ] `GET /api/recurring-items` — list all active recurring items for user
- [ ] `POST /api/recurring-items` — create a recurring item (name, amount, day_of_month, category)
- [ ] `PATCH /api/recurring-items/:id` — update a recurring item
- [ ] `DELETE /api/recurring-items/:id` — deactivate (soft delete) a recurring item
- [ ] `POST /api/budgets/:id/apply-recurring` — trigger application of recurring items for a budget month

### Business Logic
- [ ] On first fetch of a budget month, check if recurring items have been applied; if not, auto-create their transactions and mark `is_auto_generated = true`
- [ ] If a recurring item's `day_of_month` hasn't passed yet in the current month, still create the transaction but mark it as "scheduled"
- [ ] Prevent duplicate application if endpoint is called more than once for the same budget

### Frontend — Recurring Items
- [ ] "Recurring" settings page/tab: list all recurring items
- [ ] Create recurring item form: name, amount, day of month, linked category
- [ ] Toggle active/inactive on a recurring item
- [ ] Edit / delete recurring items
- [ ] Visual indicator on auto-generated transactions in the transaction drawer (e.g., "Auto" pill)

---

## Phase 7 — Savings Goals

### API Routes
- [ ] `GET /api/savings-goals` — list all savings goals for user
- [ ] `POST /api/savings-goals` — create a savings goal
- [ ] `PATCH /api/savings-goals/:id` — update goal name, target, target date
- [ ] `POST /api/savings-goals/:id/contributions` — add a contribution (amount + date)
- [ ] `DELETE /api/savings-goals/:id` — delete a goal

### Frontend — Savings Goals
- [ ] Savings page: grid/list of goal cards
- [ ] Goal card: name, progress bar (current / target), target date, amount remaining
- [ ] Create goal form: name, target amount, optional target date
- [ ] Add contribution sheet: amount + date input, updates `current_amount`
- [ ] Mark goal as complete (auto when `current_amount >= target_amount`)
- [ ] Completed goals section (collapsed by default)
- [ ] Empty state with prompt to create first goal

---

## Phase 8 — Debt Tracker

### API Routes
- [ ] `GET /api/debts` — list all debts for user (ordered by `sort_order`)
- [ ] `POST /api/debts` — add a debt
- [ ] `PATCH /api/debts/:id` — update debt info or `current_balance`
- [ ] `DELETE /api/debts/:id` — remove a debt
- [ ] `POST /api/debts/:id/payments` — record a payment (reduces `current_balance`)
- [ ] `GET /api/debts/:id/payments` — payment history for a debt
- [ ] `PATCH /api/debts/reorder` — update `sort_order` for debt snowball ordering

### Snowball Logic
- [ ] Default ordering: sort by `current_balance` ascending (smallest debt first)
- [ ] Allow drag-to-reorder for manual override
- [ ] Display estimated payoff date based on minimum payment + current balance + interest rate

### Frontend — Debt Tracker
- [ ] Debt tracker page: list of debt cards, ordered by snowball priority
- [ ] Debt card: name, original vs. current balance, interest rate, min payment, progress bar, payoff date estimate
- [ ] Add debt form: name, original balance, current balance, interest rate (%), minimum payment
- [ ] Record payment sheet: amount, date
- [ ] Payment history list (expandable)
- [ ] Total debt outstanding summary at the top of the page
- [ ] Manual reorder with drag handles
- [ ] Empty state with explanation of debt snowball method

---

## Phase 9 — Reports & Analytics

### API Routes
- [ ] `GET /api/reports/monthly-summary?year=` — income, expenses, savings by month for a full year
- [ ] `GET /api/reports/category-breakdown?month=&year=` — spending by category for a given month
- [ ] `GET /api/reports/budget-vs-actual?month=&year=` — planned vs. actual per category
- [ ] `GET /api/reports/trends?months=6` — rolling N-month trend data

### Frontend — Reports Page
- [ ] Monthly overview bar chart: income vs. expenses per month (Recharts `BarChart`)
- [ ] Category spending pie/donut chart for selected month
- [ ] Budget vs. actual horizontal bar chart per category
- [ ] Spending trend line chart (selectable 3 / 6 / 12 month window)
- [ ] Month/year selector to navigate the reports
- [ ] Summary cards at top: avg monthly income, avg monthly spend, largest expense category
- [ ] Loading skeletons for all charts while data fetches

---

## Phase 10 — PWA Configuration

- [ ] Install `vite-plugin-pwa` and configure in `vite.config.ts`
- [ ] Create `public/manifest.webmanifest`:
  - Name: "Cozy Budget", short name: "Cozy"
  - Theme color: `#7C9A7E`, background: `#FAF7F2`
  - `display: standalone`
- [ ] Generate and add app icons: 192×192, 512×512 (maskable), 180×180 (Apple touch)
- [ ] Configure service worker caching strategy (`GenerateSW`):
  - Cache-first for static assets
  - Network-first for API GET responses with cache fallback
- [ ] Add `<meta>` tags for iOS PWA support (`apple-mobile-web-app-capable`, status bar style)
- [ ] Build and test install flow on iOS Safari and Android Chrome
- [ ] Add install prompt banner component that appears on first visit (dismissible, stored in localStorage)

---

## Phase 11 — Navigation & Shell

- [ ] Design and build the main app shell (responsive sidebar on desktop, bottom nav on mobile)
- [ ] Navigation items: Budget, Savings, Debt, Reports, Settings
- [ ] Month/year context: globally accessible via Zustand store, persisted to localStorage
- [ ] Active month displayed prominently in the header
- [ ] Settings page: account info, sign out, manage recurring items, manage categories
- [ ] 404 / not found page
- [ ] Global error boundary with user-friendly fallback UI

---

## Phase 12 — Production Deployment

### Supabase
- [ ] Create Supabase project and grab the pooler connection string
- [ ] Run `drizzle-kit migrate` against the Supabase DB
- [ ] Run seed script against production DB
- [ ] Confirm BetterAuth tables are present

### Vercel
- [ ] Create Vercel project for `apps/web` (root: `apps/web`, build: `vite build`)
- [ ] Create Vercel project for `apps/api` (root: `apps/api`, framework: Next.js)
- [ ] Set all required env vars in each Vercel project dashboard
- [ ] Configure CORS in Next.js API to allow requests from the `apps/web` Vercel domain
- [ ] Deploy and smoke-test: sign up, create budget, add transaction, check PWA install

### Post-Deploy Checks
- [ ] Sign up flow works end-to-end
- [ ] Recurring items apply correctly on first month load
- [ ] Budget alerts fire at 90% and 100%
- [ ] PWA installs and launches in standalone mode on iOS and Android
- [ ] All pages load in < 3s on mobile (Lighthouse check)

---

## Phase 13 — QA & Polish

- [ ] Responsive design review on: iPhone SE, iPhone 15 Pro, iPad, desktop
- [ ] Accessibility audit: keyboard navigation, focus styles, ARIA labels, color contrast
- [ ] Add loading skeletons to every page that fetches data
- [ ] Add empty states to all lists (budgets, transactions, goals, debts)
- [ ] Error states: API failures are caught and displayed with a user-friendly message
- [ ] Global toast notification system wired up for budget alerts, success confirmations, errors
- [ ] Confirm no `console.log` statements exist in committed code
- [ ] Run Lighthouse audit (target: Performance ≥ 85, Accessibility ≥ 90, PWA ≥ 90)
- [ ] Test recurring item auto-deduction across a month boundary
- [ ] Test copy budget from previous month

---

## Suggested Build Order Summary

```
Phase 1  → Foundation & tooling
Phase 2  → Schema & database
Phase 3  → Auth (login/signup)
Phase 4  → Budget CRUD (core loop)
Phase 5  → Transactions + alerts
Phase 6  → Recurring items
Phase 7  → Savings goals
Phase 8  → Debt tracker
Phase 9  → Reports
Phase 10 → PWA
Phase 11 → App shell & nav polish
Phase 12 → Deploy to production
Phase 13 → QA & polish
```
