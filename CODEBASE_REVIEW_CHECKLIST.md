# Cozy Budget Codebase Review Checklist

Use this checklist to review the app for best practices, redundancy, and DRY issues.
This is intended to guide cleanup and refactoring work across the existing codebase.

It is separate from [CHECKLIST.md](./CHECKLIST.md), which is focused on feature and build planning.

---

## How To Use This

- [ ] Review one area at a time: `apps/web`, `apps/api`, then `packages/shared`
- [ ] Prioritize repeated patterns that appear in 3+ places before polishing one-off code
- [ ] Favor shared helpers for domain rules, but avoid forcing unrelated code into abstractions
- [ ] When deduplicating, confirm behavior stays the same before moving logic
- [ ] Add tests around reused logic before or during refactors where risk is non-trivial

---

## Priority 1: Quick Wins

### Shared Money / Date Handling
- [ ] Replace repeated `Math.round(parseFloat(value) * 100)` calls with a shared helper
- [ ] Replace repeated `(amount / 100).toFixed(2)` formatting with a shared helper where appropriate
- [ ] Audit all money parsing to make sure invalid input is rejected consistently
- [ ] Confirm date helpers are used consistently for `YYYY-MM-DD` display and defaults
- [ ] Keep currency and date formatting in one place unless a feature genuinely needs a variant

Examples currently worth reviewing:
- `apps/web/src/components/budget/AddTransactionForm.tsx`
- `apps/web/src/components/budget/AddBudgetItemDialog.tsx`
- `apps/web/src/components/budget/BudgetItemRow.tsx`
- `apps/web/src/pages/SavingsPage.tsx`
- `apps/web/src/pages/DebtPage.tsx`
- `apps/web/src/pages/RecurringPage.tsx`
- `apps/web/src/lib/formatters.ts`

### React Query Consistency
- [ ] Centralize query key builders instead of recreating them in multiple hooks
- [ ] Centralize common mutation behavior when it always follows `api call -> throw on error -> invalidate queries`
- [ ] Review whether related hooks can share a small utility instead of repeating near-identical mutation code
- [ ] Confirm invalidation keys are consistent across pages and hooks

Examples currently worth reviewing:
- `apps/web/src/hooks/useBudget.ts`
- `apps/web/src/hooks/useTransactions.ts`
- `apps/web/src/hooks/useCategories.ts`
- `apps/web/src/hooks/useSavingsGoals.ts`
- `apps/web/src/hooks/useRecurringItems.ts`
- `apps/web/src/hooks/useDebts.ts`

### API Response Helpers
- [ ] Create shared response helpers for success and error responses
- [ ] Normalize error message wording across endpoints
- [ ] Standardize common status codes for validation, auth, not-found, and conflict cases
- [ ] Reduce repeated `NextResponse.json({ data, error })` boilerplate

Examples currently worth reviewing:
- `apps/api/src/app/api/budgets/[id]/copy/route.ts`
- `apps/api/src/app/api/budgets/[id]/items/[itemId]/route.ts`
- `apps/api/src/app/api/transactions/route.ts`
- `apps/api/src/app/api/transactions/[id]/route.ts`
- `apps/api/src/app/api/categories/[id]/route.ts`

---

## Priority 2: Frontend DRY Review

### Forms and Validation
- [ ] Identify repeated inline `zod` schemas in components and pages
- [ ] Move shared validation rules into `packages/shared` when client and server rules must match
- [ ] Extract reusable schema fragments for common fields like money, note, date, and name
- [ ] Review whether form submission adapters can convert dollars to cents in one shared place
- [ ] Standardize how form reset behavior works after successful submission

Examples currently worth reviewing:
- `apps/web/src/components/budget/AddTransactionForm.tsx`
- `apps/web/src/components/budget/AddBudgetItemDialog.tsx`
- `apps/web/src/components/budget/CopyBudgetDialog.tsx`
- `apps/web/src/pages/SavingsPage.tsx`
- `apps/web/src/pages/DebtPage.tsx`
- `apps/web/src/pages/RecurringPage.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `apps/web/src/pages/SettingsPage.tsx`

### Repeated UI Patterns
- [ ] Review repeated loading states and extract small shared patterns where the UI should stay consistent
- [ ] Review repeated empty states and error banners for reusable building blocks
- [ ] Prefer existing shared UI primitives over raw HTML controls when consistency matters
- [ ] Check whether repeated modal, drawer, and confirmation flows can share wrappers or hooks
- [ ] Keep abstractions light; extract only when the UI and behavior are actually shared

Examples currently worth reviewing:
- `apps/web/src/pages/BudgetPage.tsx`
- `apps/web/src/pages/SavingsPage.tsx`
- `apps/web/src/pages/DebtPage.tsx`
- `apps/web/src/pages/RecurringPage.tsx`
- `apps/web/src/components/budget/TransactionDrawer.tsx`
- `apps/web/src/components/ui`

### State and Side Effects
- [ ] Check for side effects happening during render or in unstable code paths
- [ ] Move effectful logic into hooks or `useEffect` when it should not run on every render
- [ ] Review whether local component state is too spread out and can be grouped more cleanly
- [ ] Keep page components focused on orchestration; move reusable behavior into hooks/helpers

Examples currently worth reviewing:
- `apps/web/src/pages/BudgetPage.tsx`
- `apps/web/src/components/budget/TransactionDrawer.tsx`
- `apps/web/src/stores/useBudgetStore.ts`

### Derived Data and Business Calculations
- [ ] Extract repeated totals, percentages, and grouping logic into tested helpers
- [ ] Keep formatting separate from business calculations
- [ ] Ensure derived values are calculated the same way across all views
- [ ] Review whether calculations belong in hooks, helpers, or shared domain code

Examples currently worth reviewing:
- `apps/web/src/hooks/useBudget.ts`
- `apps/web/src/pages/SavingsPage.tsx`
- `apps/web/src/pages/DebtPage.tsx`
- `apps/web/src/pages/ReportsPage.tsx`
- `apps/web/src/components/reports/ReportsCharts.tsx`

---

## Priority 3: API DRY Review

### Auth and Ownership Checks
- [ ] Standardize the route handler flow around authentication
- [ ] Extract reusable ownership/resource lookup helpers for budgets, transactions, debts, goals, and categories
- [ ] Reduce repeated "find resource and verify it belongs to current user" logic
- [ ] Confirm every write route verifies ownership before mutation

Examples currently worth reviewing:
- `apps/api/src/middleware/requireAuth.ts`
- `apps/api/src/app/api/budgets/[id]/items/[itemId]/route.ts`
- `apps/api/src/app/api/transactions/route.ts`
- `apps/api/src/app/api/transactions/[id]/route.ts`
- `apps/api/src/app/api/debts/[id]/route.ts`
- `apps/api/src/app/api/savings-goals/[id]/route.ts`

### Validation
- [ ] Use one request body parsing pattern across all routes
- [ ] Prefer shared schemas from `packages/shared` over route-local validation where possible
- [ ] Normalize validation error formatting
- [ ] Review whether route params and query params also need shared parsing helpers

Examples currently worth reviewing:
- `apps/api/src/lib/validation.ts`
- `apps/api/src/app/api/debts/route.ts`
- `apps/api/src/app/api/debts/reorder/route.ts`
- `apps/api/src/app/api/savings-goals/route.ts`
- `apps/api/src/app/api/savings-goals/[id]/contribute/route.ts`

### Data Access Patterns
- [ ] Review repeated Drizzle query shapes and relation loading
- [ ] Extract repeated "fetch updated row with relations" patterns where it improves clarity
- [ ] Check multi-step writes for transaction safety
- [ ] Confirm destructive or multi-record operations are atomic when they should be

Examples currently worth reviewing:
- `apps/api/src/app/api/budgets/[id]/copy/route.ts`
- `apps/api/src/app/api/budgets/[id]/apply-recurring/route.ts`
- `apps/api/src/app/api/budgets/[id]/items/route.ts`
- `apps/api/src/app/api/debts/[id]/payments/route.ts`

---

## Priority 4: Shared Package Review

### Shared Boundaries
- [ ] Decide what should live in `packages/shared`: schemas, types, constants, and domain helpers
- [ ] Avoid duplicating domain rules between `web`, `api`, and `shared`
- [ ] Add shared helpers only when they represent true cross-app behavior
- [ ] Keep UI-specific logic out of `packages/shared` unless the package is explicitly meant to host shared UI

Examples currently worth reviewing:
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas`
- `packages/shared/src/types`
- `packages/shared/src/constants`

### Schema and Type Alignment
- [ ] Confirm shared schemas match actual API expectations
- [ ] Remove client-only validation rules that duplicate server rules unless UI behavior requires them
- [ ] Review whether API response typing can better drive safer client helpers
- [ ] Keep exported types and schemas organized so feature modules are easy to find

---

## Priority 5: Tooling and Quality Gates

### Linting and Standards
- [ ] Review lint configuration at the repo and app level for gaps
- [ ] Add rules or conventions for repeated anti-patterns discovered during cleanup
- [ ] Confirm formatting, linting, and type-check scripts are consistent across apps
- [ ] Consider whether some repeated code smells can be caught automatically

Examples currently worth reviewing:
- `package.json`
- `turbo.json`
- `apps/web/eslint.config.cjs`
- `apps/web/package.json`
- `apps/api/package.json`

### Tests
- [ ] Add focused tests for shared helpers before large deduplication refactors
- [ ] Add route tests for auth, validation, and ownership checks
- [ ] Add regression tests for calculations used in budgets, savings, debts, and reports
- [ ] Prioritize tests around code that will be reused in multiple flows

---

## Refactor Guardrails

- [ ] Do not abstract code just because it looks similar; confirm the behavior is truly shared
- [ ] Prefer small, boring utilities over large generic frameworks
- [ ] Keep feature names and domain concepts explicit even after deduplication
- [ ] Refactor one pattern class at a time: money fields, response helpers, query keys, ownership lookups, etc.
- [ ] Run lint, type-check, and relevant tests after each cleanup slice

---

## Suggested Cleanup Order

- [ ] Shared money/date helpers
- [ ] Query key and mutation helper cleanup
- [ ] API response helper cleanup
- [ ] Route validation/auth/ownership helper cleanup
- [ ] Shared schema fragment cleanup for forms
- [ ] Derived calculation extraction and test coverage
- [ ] UI pattern extraction only after logic cleanup is stable

