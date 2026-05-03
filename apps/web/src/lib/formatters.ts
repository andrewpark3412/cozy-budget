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
  }).format(new Date(`${dateStr}T00:00:00Z`))

/** Return today as a YYYY-MM-DD string */
export const todayISO = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/** e.g. month=3, year=2026 → "March 2026" */
export const formatMonthYear = (month: number, year: number): string =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )

/** Return the previous month/year pair for a given month/year. */
export const getPreviousMonthYear = (
  month: number,
  year: number,
): { month: number; year: number } =>
  month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year }

/** Parse a string amount and report whether it is a finite number. */
export const parseAmountInput = (value: string): number => Number.parseFloat(value)

/** Check whether a string amount is a valid finite number within an optional minimum. */
export const isValidAmountInput = (value: string, minimum = 0): boolean => {
  const amount = parseAmountInput(value)
  return Number.isFinite(amount) && amount >= minimum
}

/** Convert a dollar string input to cents integer. e.g. "15.50" → 1550 */
export const dollarsToCents = (dollars: string): number =>
  Math.round(parseAmountInput(dollars) * 100)

/** Convert cents to a dollar string for form inputs. e.g. 1550 → "15.50" */
export const centsToDollars = (cents: number): string => (cents / 100).toFixed(2)
