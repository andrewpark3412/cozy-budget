/**
 * Format an integer number of cents as a currency string.
 * e.g. 150000 → "$1,500.00"
 */
export const formatCurrency = (cents: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)

/**
 * Format a YYYY-MM-DD date string for display.
 * e.g. "2026-03-21" → "Mar 21, 2026"
 */
export const formatDate = (dateStr: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))

/** Return today as a YYYY-MM-DD string */
export const todayISO = (): string => new Date().toISOString().slice(0, 10)

/** e.g. month=3, year=2026 → "March 2026" */
export const formatMonthYear = (month: number, year: number): string =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )

/** Convert a dollar string input to cents integer. e.g. "15.50" → 1550 */
export const dollarsToCents = (dollars: string): number =>
  Math.round(parseFloat(dollars) * 100)

/** Convert cents to a dollar string for form inputs. e.g. 1550 → "15.50" */
export const centsToDollars = (cents: number): string => (cents / 100).toFixed(2)
