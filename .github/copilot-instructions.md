---
applyTo: "**"
---

# Cozy Budget — GitHub Copilot Instructions

## Project Overview

Cozy Budget is a personal budgeting PWA for couples/families to manage monthly budgets,
track income and expenses, monitor savings goals, and track debt payoff progress. The
experience is inspired by EveryDollar (zero-based budgeting) but does NOT include premium
features such as bank account integration.

---

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: `apps/web` — React 19 + Vite, PWA, shadcn/ui, Tailwind CSS
- **Backend**: `apps/api` — Next.js 15 (App Router, API routes only — no SSR pages)
- **Database**: PostgreSQL (Docker locally, Supabase in production)
- **Auth**: BetterAuth v1 (email/password, no email verification required)
- **Shared**: `packages/shared` — TypeScript types, Zod schemas, utilities

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) everywhere |
| Frontend framework | React 19 + Vite 6 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 (React Query) |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod resolver |
| UI components | shadcn/ui |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Backend framework | Next.js 15 (API routes / App Router) |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth | BetterAuth v1 |
| Database | PostgreSQL |
| Local DB | Docker Compose |
| Production DB | Supabase |
| Deployment | Vercel (web + api) |

---

## Design System

### Color Palette — "Cozy" Theme

```
Primary (sage green):     #7C9A7E  — main actions, active states
Accent (warm amber):      #D4845A  — highlights, CTAs, alerts
Background (warm cream):  #FAF7F2  — page background
Surface (soft white):     #FFFFFF  — cards, modals
Border:                   #E8E2D9  — subtle dividers
Muted text:               #8C8479  — secondary text
Body text (charcoal):     #2D2A26  — primary text
Danger (soft red):        #C0615A  — over-budget states, errors
Success (soft green):     #5A8C6A  — on-budget, completed states
```

### Typography
- Font family: `Inter` (or `Geist` if available)
- Use Tailwind's `font-sans` as the base
- Headings: `font-semibold`, body: `font-normal`

### Tone & Feel
- Warm, approachable, friendly — not corporate or sterile
- Calm greens and ambers evoke a "cozy cabin" feeling
- Avoid harsh shadows; use soft shadows and rounded corners (`rounded-xl`, `rounded-2xl`)
- Use subtle gradients sparingly for hero/summary cards

### Component Conventions
- Base all UI on `shadcn/ui` components — do not modify files under `components/ui/`
- Extend with project-specific variants in `components/common/`, `components/budget/`, etc.
- Always include loading skeletons and empty states for data-driven components
- Use `Skeleton` component from shadcn for loading states

---

## Code Style & Conventions

### General
- TypeScript strict mode enabled in all `tsconfig.json` files
- Use `const` for all function/component declarations: `const MyComponent = () => {}`
- Prefer named exports; use default exports only where a framework requires it (e.g., Next.js page/layout files)
- No `any` types — use proper typing or `unknown`
- No `console.log` in committed code — use structured error handling

### Imports
- Use path aliases: `@/` maps to `src/` in each app
- Shared package imports: `@cozy-budget/shared`
- Group imports: external libs → internal aliases → relative paths

### Validation
- Use Zod for all runtime validation (API request bodies, form data, env vars)
- Define Zod schemas in `packages/shared/src/schemas/` so they can be reused client and server side
- Suffix schema names with `Schema` (e.g., `createBudgetItemSchema`)

### Forms
- Use React Hook Form with `zodResolver` for all forms
- Never use uncontrolled native `<form>` submissions

### API Responses
All API responses must follow this envelope pattern:

```typescript
// Success
{ data: T; error: null }

// Failure
{ data: null; error: string }
```

Use HTTP status codes correctly: `200` OK, `201` Created, `400` Bad Request, `401`
Unauthorized, `403` Forbidden, `404` Not Found, `422` Validation Error, `500` Server Error.

---

## Project Structure

### Frontend (`apps/web/src/`)

```
components/
  ui/             # shadcn/ui generated components — DO NOT EDIT
  common/         # AppShell, ProtectedRoute, ErrorBoundary, InstallPromptBanner
  budget/         # AddBudgetItemDialog, AddTransactionForm, BudgetItemRow,
                  # CategorySection, CopyBudgetDialog, LeftToBudgetBanner,
                  # MonthNav, TransactionDrawer
  transactions/   # (not yet built)
  savings/        # (not yet built)
  debt/           # (not yet built)
  reports/        # (not yet built)
hooks/            # custom React hooks (prefixed with "use")
lib/
  api.ts          # typed API client (wraps fetch with auth headers)
  auth-client.ts  # BetterAuth client (authClient, signIn, signUp, signOut, useSession)
  utils.ts        # general utilities
  formatters.ts   # currency, date formatters
pages/            # route-level page components (one per route)
stores/           # Zustand store definitions
types/            # local TypeScript type re-exports (currently empty)
```

### Routes (`apps/web/src/App.tsx`)

| Path | Component | Auth |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/signup` | `SignUpPage` | Public |
| `/` | Redirect → `/budget` | Protected |
| `/budget` | `BudgetPage` | Protected |
| `/savings` | `SavingsPage` | Protected |
| `/debt` | `DebtPage` | Protected |
| `/reports` | `ReportsPage` | Protected |
| `/recurring` | `RecurringPage` | Protected |
| `/settings` | `SettingsPage` | Protected |
| `/faq` | `FAQPage` | Protected |
| `*` | `NotFoundPage` | Public |

Protected routes are wrapped in `<ProtectedRoute>` → `<AppShell>`. `<Toaster>` and `<InstallPromptBanner>` are rendered outside the route tree.

### Backend (`apps/api/`)

```
src/
  app/
    api/          # Next.js App Router API route handlers
  db/
    schema/       # Drizzle ORM table definitions (one file per domain)
    migrations/   # Drizzle migration files (generated, do not edit)
    index.ts      # Drizzle client singleton
  lib/
    auth.ts       # BetterAuth configuration
    validation.ts # Zod helpers for request parsing
  middleware/     # Auth session middleware helpers
    requireAuth.ts  # requireAuth(req) → { userId } | NextResponse 401
  middleware.ts   # Next.js edge middleware — CORS via TRUSTED_ORIGINS env var
```

### API Routes (`apps/api/src/app/api/`)

| HTTP Path | Methods |
|---|---|
| `/api/auth/*` | BetterAuth catch-all |
| `/api/health` | GET |
| `/api/budgets` | GET, POST |
| `/api/budgets/:id/items` | GET, POST |
| `/api/budgets/:id/items/:itemId` | PATCH, DELETE |
| `/api/budgets/:id/transactions` | GET |
| `/api/budgets/:id/apply-recurring` | POST |
| `/api/budgets/:id/copy` | POST |
| `/api/categories` | GET, POST |
| `/api/categories/:id` | PATCH, DELETE |
| `/api/transactions` | POST |
| `/api/transactions/:id` | PATCH, DELETE |
| `/api/recurring-items` | GET, POST |
| `/api/recurring-items/:id` | PATCH, DELETE |
| `/api/savings-goals` | GET, POST |
| `/api/savings-goals/:id` | PATCH, DELETE |
| `/api/savings-goals/:id/contribute` | POST |
| `/api/debts` | GET, POST |
| `/api/debts/:id` | PATCH, DELETE |
| `/api/debts/:id/payments` | POST |
| `/api/debts/reorder` | PATCH |
| `/api/reports/monthly` | GET |

### Shared (`packages/shared/src/`)

```
schemas/          # Zod schemas shared between web and api
types/            # Shared TypeScript types/interfaces
constants/        # Category presets, config constants
```

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | `PascalCase` | `BudgetCard.tsx` |
| Custom hooks | `camelCase`, `use` prefix | `useBudgetMonth.ts` |
| Utilities | `camelCase` | `formatCurrency.ts` |
| Zustand stores | `camelCase`, `use` prefix | `useBudgetStore.ts` |
| DB tables | `snake_case` | `budget_items` |
| API routes | RESTful, kebab-case | `/api/budget-items` |
| Zod schemas | `camelCase` + `Schema` suffix | `createBudgetItemSchema` |
| Types/interfaces | `PascalCase` | `BudgetItem`, `Transaction` |

---

## Database Schema (Domain Model)

### Monetary Values
All monetary amounts (balances, planned amounts, transaction amounts, payments) are stored as **integers in cents**. Never store dollars as floats in the database. Convert to/from dollars only at the UI layer using `formatters.ts`.

### Date Storage
Non-timestamp date fields (e.g., `date`, `payment_date`, `target_date`) are stored as `text` in `YYYY-MM-DD` format. Timestamp audit fields use `timestamp with time zone`.

### Core Tables

```
user                — managed by BetterAuth (singular table name)
session             — managed by BetterAuth (singular table name)
account             — managed by BetterAuth (singular table name)
verification        — managed by BetterAuth (singular table name)
budgets             — one per user per month/year
categories          — predefined (system) + custom, scoped to user
budget_items        — planned amount (cents) per category per budget
transactions        — actual income/expense entries
recurring_items     — template for auto-generating transactions each month
savings_goals       — savings targets with contribution progress
debts               — loan/credit balances for snowball tracking
debt_payments       — payment history per debt
```

### Drizzle Conventions
- Define all schemas in `apps/api/src/db/schema/`; one file per domain (e.g., `budgets.ts`, `transactions.ts`)
- All application tables use `id text PRIMARY KEY` defaulting to `crypto.randomUUID()` (not PostgreSQL `gen_random_uuid()`)
- Timestamps: `timestamp('created_at', { withTimezone: true }).defaultNow().notNull()`
- All tables have `created_at` and `updated_at`; `debt_payments` only has `created_at`
- Always use Drizzle migrations — never mutate the database schema directly
- Use database transactions (`db.transaction()`) for any operation spanning multiple tables

### Table: `budgets`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK, `crypto.randomUUID()` |
| `user_id` | `text` | NOT NULL, FK → `user.id` cascade delete |
| `month` | `integer` | NOT NULL (1–12) |
| `year` | `integer` | NOT NULL |
| `recurring_applied` | `integer` | NOT NULL, default `0` — `1` after recurring items are applied for this month |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

Unique constraint: `(user_id, month, year)`

### Table: `budget_items`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `budget_id` | `text` | FK → `budgets.id` cascade delete |
| `category_id` | `text` | FK → `categories.id` restrict delete |
| `planned_amount` | `integer` | NOT NULL, default `0` — **cents** |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `user_id` | `text` | **nullable** — `null` = system/predefined category |
| `name` | `text` | NOT NULL |
| `type` | `text` | `'income'` or `'expense'` |
| `is_system` | `boolean` | NOT NULL, default `false` — only `Giving` is `true` |
| `sort_order` | `integer` | NOT NULL, default `0` |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `transactions`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `budget_item_id` | `text` | FK → `budget_items.id` cascade delete |
| `amount` | `integer` | NOT NULL — **cents** |
| `date` | `text` | NOT NULL — `YYYY-MM-DD` |
| `note` | `text` | nullable |
| `is_auto_generated` | `boolean` | NOT NULL, default `false` — `true` for recurring-generated transactions |
| `recurring_item_id` | `text` | nullable, FK → `recurring_items.id` set null on delete |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `recurring_items`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `user_id` | `text` | FK → `user.id` cascade delete |
| `category_id` | `text` | FK → `categories.id` restrict delete |
| `name` | `text` | NOT NULL |
| `amount` | `integer` | NOT NULL — **cents** |
| `day_of_month` | `integer` | NOT NULL (1–31) |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `savings_goals`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `user_id` | `text` | FK → `user.id` cascade delete |
| `name` | `text` | NOT NULL |
| `target_amount` | `integer` | NOT NULL — **cents** |
| `current_amount` | `integer` | NOT NULL, default `0` — **cents** |
| `target_date` | `text` | nullable — `YYYY-MM-DD` |
| `is_complete` | `boolean` | NOT NULL, default `false` |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `debts`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `user_id` | `text` | FK → `user.id` cascade delete |
| `name` | `text` | NOT NULL |
| `original_balance` | `integer` | NOT NULL — **cents** |
| `current_balance` | `integer` | NOT NULL — **cents** |
| `interest_rate` | `real` | NOT NULL, default `0` — e.g. `5.5` = 5.5% |
| `minimum_payment` | `integer` | NOT NULL, default `0` — **cents** |
| `sort_order` | `integer` | NOT NULL, default `0` |
| `created_at` / `updated_at` | `timestamp tz` | NOT NULL |

### Table: `debt_payments`
| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `debt_id` | `text` | FK → `debts.id` cascade delete |
| `amount` | `integer` | NOT NULL — **cents** |
| `payment_date` | `text` | NOT NULL — `YYYY-MM-DD` |
| `created_at` | `timestamp tz` | NOT NULL (no `updated_at`) |

---

## Key Domain Concepts

| Concept | Description |
|---|---|
| **Budget** | A user's zero-based spending plan for a specific month + year |
| **Category** | A grouping for budget items. Predefined defaults exist; users can add/rename/delete custom ones |
| **Budget Item** | A line item in a category with a planned dollar amount (e.g., Rent: $1,500) |
| **Transaction** | An actual income receipt or expense payment recorded against a budget item |
| **Recurring Item** | A transaction template (amount, day-of-month, budget item) that auto-generates each month |
| **Savings Goal** | A named target amount with contributions tracked toward completion |
| **Debt** | A named liability (e.g., car loan) with balance, rate, and minimum payment for payoff tracking |

---

## Business Logic Rules

- **Zero-based budgeting**: Every dollar of income must be assigned. Show "left to budget" = total income − total planned expenses.
- **Month isolation**: Each budget is independent per month/year. Copying a budget duplicates `budget_items` (planned amounts) only — not transactions.
- **Recurring items**: When a budget is first accessed for a new month, the API checks `budgets.recurring_applied`. If `0`, it creates transactions for all active recurring items and sets `recurring_applied = 1`. Use `POST /api/budgets/:id/apply-recurring`.
- **Budget alerts**: Trigger a warning toast when a category reaches 90% of its planned amount; trigger a danger toast/banner when it exceeds 100%.
- **Debt snowball**: Order debts by remaining balance ascending by default (smallest first). Allow manual reordering via `PATCH /api/debts/reorder`.
- **Giving**: "Giving" is a top-level system category (`is_system: true`) that cannot be deleted (mirrors EveryDollar's treatment).
- **Predefined categories**: 36 categories seeded at startup across Income, Giving, Saving, Housing, Transport, Food, Personal, Lifestyle, Debt, and Other groups. System categories have `user_id = null`.

### Predefined Category Groups

| Group | Categories |
|---|---|
| Income | Paycheck, Other Income |
| Giving | Giving *(system — undeletable)* |
| Saving | Emergency Fund, Retirement, Other Savings |
| Housing | Rent / Mortgage, HOA, Home Insurance, Property Tax, Repairs & Maintenance |
| Transport | Car Payment, Car Insurance, Gas, Parking, Car Maintenance |
| Food | Groceries, Dining Out, Coffee Shops |
| Personal | Clothing, Medical / Dental, Gym, Haircuts, Personal Care |
| Lifestyle | Subscriptions, Entertainment, Hobbies, Vacation |
| Debt | Credit Card, Student Loan, Other Debt |
| Other | Miscellaneous |

---

## State Management Strategy

| State Type | Tool |
|---|---|
| Server/async data | TanStack Query — no manual fetch in components |
| Global UI state | Zustand (e.g., selected month, alert queue) |
| Local component state | `useState` / `useReducer` |
| Form state | React Hook Form |

`useBudgetStore` (Zustand + `persist` middleware, localStorage key `'cozy-budget-month'`) tracks `selectedMonth` and `selectedYear` with actions `setMonth`, `goToPrevMonth`, `goToNextMonth`.

---

## Auth & Security

- All Next.js API route handlers must call `requireAuth(req)` at the top before any business logic. If the result is a `NextResponse`, return it immediately (signals 401).
- `requireAuth` validates the BetterAuth session via `auth.api.getSession({ headers: req.headers })` and returns `{ userId: string }` on success.
- Users may only access their own data — always filter queries by `userId` from the verified session
- Never expose raw DB errors or internal stack traces in API responses
- Use parameterized queries via Drizzle ORM — never string-interpolate SQL
- Validate all API request bodies server-side with Zod, even when the client also validates
- All secrets (DB URL, auth secret, etc.) live in environment variables — never hardcode
- CORS is handled in `apps/api/src/middleware.ts` — allowed origins are set via the `TRUSTED_ORIGINS` env var (comma-separated list). The middleware never uses `Access-Control-Allow-Origin: *`
- BetterAuth config: `emailAndPassword` enabled, `requireEmailVerification: false`, sessions expire after 30 days

---

## PWA Requirements

- Configure `vite-plugin-pwa` with a service worker using `generateSW` strategy and `autoUpdate` register type
- Cache static assets (`**/*.{js,css,html,ico,png,svg,woff2}`) and API GET responses for offline read access
- Runtime cache for `/api/*`: `NetworkFirst`, max 100 entries, 24 hr max age, 10 s network timeout
- Provide `manifest.webmanifest` with: app name "Cozy Budget", short name "Cozy", theme color `#7C9A7E`, background color `#FAF7F2`, `display: standalone`, `orientation: portrait`
- Icon files live in `apps/web/public/icons/`: `icon-192.png` (192×192), `icon-512.png` (512×512), `icon-512-maskable.png` (512×512, purpose `maskable`)
- `apple-touch-icon.png` is included in `includeAssets` for iOS home screen support
- Show an install prompt banner on first visit (`InstallPromptBanner` component)

---

## Accessibility

- All interactive elements must be keyboard-navigable and have visible focus styles
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- All images and icons must have `aria-label` or `alt` text
- Color contrast ratio must pass WCAG AA (4.5:1 for normal text)
- Form fields must have associated `<label>` elements

---

## What NOT to Implement

Do not implement or suggest any of the following:
- Bank account / financial institution integration (e.g., Plaid)
- Premium subscription tiers or paywalls
- Real-time presence or multi-user live collaboration
- Push notifications via native device APIs (alerts are in-app only)
- AI-powered categorization or spending insights

---

## Local Development

```bash
make install    # Install all dependencies
make dev        # Start Postgres in Docker + all apps in watch mode
make db         # Start only the Postgres Docker container
make db-stop    # Stop Docker containers
make db-reset   # Destroy and recreate the DB (WARNING: data loss)
make migrate    # Run Drizzle migrations against local DB
make seed       # Seed predefined categories
make type-check # Run TypeScript type-checking across all packages
make lint       # Run ESLint across all packages
make format     # Run Prettier across all files
```

Environment variables live in:
- `apps/web/.env.local`
- `apps/api/.env.local`
- Copy from `*.env.example` files

---

## Production Deployment

- **Frontend + Backend**: Vercel (monorepo — configure both `apps/web` and `apps/api` as separate Vercel projects)
- **Database**: Supabase (PostgreSQL) — use the pooler connection string in production
- **Environment**: Set all `*.env.local` variables as Vercel environment variables
- Run `drizzle-kit migrate` against the Supabase DB before first deploy
