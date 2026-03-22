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
- **Frontend**: `apps/web` — React 18 + Vite, PWA, shadcn/ui, Tailwind CSS
- **Backend**: `apps/api` — Next.js (App Router, API routes only — no SSR pages)
- **Database**: PostgreSQL (Docker locally, Supabase in production)
- **Auth**: BetterAuth (email/password)
- **Shared**: `packages/shared` — TypeScript types, Zod schemas, utilities

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) everywhere |
| Frontend framework | React 18 + Vite |
| Routing | React Router v6 |
| Server state | TanStack Query v5 (React Query) |
| Client state | Zustand |
| Forms | React Hook Form + Zod resolver |
| UI components | shadcn/ui |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Backend framework | Next.js 14+ (API routes / App Router) |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth | BetterAuth |
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
  common/         # shared app-level components (Layout, Nav, etc.)
  budget/         # monthly budget view components
  transactions/   # transaction list/form components
  savings/        # savings goal components
  debt/           # debt tracker components
  reports/        # chart and reporting components
hooks/            # custom React hooks (prefixed with "use")
lib/
  api.ts          # typed API client (wraps fetch with auth headers)
  utils.ts        # general utilities
  formatters.ts   # currency, date formatters
pages/            # route-level page components
stores/           # Zustand store definitions
types/            # local TypeScript type re-exports
```

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
```

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

### Core Tables

```
users               — managed by BetterAuth
sessions            — managed by BetterAuth
budgets             — one per user per month/year
categories          — predefined + custom, scoped to user
budget_items        — planned $ amount per category per budget
transactions        — actual income/expense entries
recurring_items     — template for auto-deducting transactions
savings_goals       — savings targets with progress
debts               — loan/credit balances for snowball tracking
debt_payments       — payment history per debt
```

### Drizzle Conventions
- Define all schemas in `apps/api/src/db/schema/`; one file per domain (e.g., `budgets.ts`, `transactions.ts`)
- All tables must have `id` (uuid, default `gen_random_uuid()`), `created_at`, `updated_at`
- Timestamps: `timestamp('created_at', { withTimezone: true }).defaultNow().notNull()`
- Always use Drizzle migrations — never mutate the database schema directly
- Use database transactions (`db.transaction()`) for any operation spanning multiple tables

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
- **Recurring items**: On the first load of a new month's budget, the system checks for recurring items and auto-creates their corresponding transactions.
- **Budget alerts**: Trigger a warning toast when a category reaches 90% of its planned amount; trigger a danger toast/banner when it exceeds 100%.
- **Debt snowball**: Order debts by remaining balance ascending by default (smallest first). Allow manual reordering.
- **Giving**: "Giving" is a top-level predefined category that cannot be deleted (mirrors EveryDollar's treatment).

---

## State Management Strategy

| State Type | Tool |
|---|---|
| Server/async data | TanStack Query — no manual fetch in components |
| Global UI state | Zustand (e.g., selected month, alert queue) |
| Local component state | `useState` / `useReducer` |
| Form state | React Hook Form |

---

## Auth & Security

- All Next.js API route handlers must verify the BetterAuth session at the top of the handler before any business logic
- Users may only access their own data — always filter queries by `userId` from the verified session
- Never expose raw DB errors or internal stack traces in API responses
- Use parameterized queries via Drizzle ORM — never string-interpolate SQL
- Validate all API request bodies server-side with Zod, even when the client also validates
- All secrets (DB URL, auth secret, etc.) live in environment variables — never hardcode

---

## PWA Requirements

- Configure `vite-plugin-pwa` with a service worker using `GenerateSW` strategy
- Cache static assets and API GET responses for offline read access
- Provide `manifest.webmanifest` with: app name "Cozy Budget", short name "Cozy", theme color `#7C9A7E`, background color `#FAF7F2`, `display: standalone`
- Supply icons in sizes: 192×192, 512×512 (maskable), 180×180 (Apple touch)
- Show an install prompt banner on first visit

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
make install   # Install all dependencies
make dev       # Start Postgres in Docker + all apps in watch mode
make db        # Start only the Postgres Docker container
make db-stop   # Stop Docker containers
make db-reset  # Destroy and recreate the DB (WARNING: data loss)
make migrate   # Run Drizzle migrations against local DB
make seed      # Seed predefined categories
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
