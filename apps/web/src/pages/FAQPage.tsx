import { useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string | string[]
}

interface FAQSection {
  title: string
  items: FAQItem[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const faqSections: FAQSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What is Cozy Budget?',
        answer:
          'Cozy Budget is a personal budgeting app designed for couples and families. It uses zero-based budgeting to help you plan every dollar of income, track your spending, monitor savings goals, and pay down debt — all in one cozy place.',
      },
      {
        question: 'How do I create an account?',
        answer: [
          'Navigate to the Sign Up page from the login screen.',
          'Enter your name, email address, and a secure password.',
          'Click "Create Account" — you will be logged in immediately and taken to your first budget.',
        ],
      },
      {
        question: 'What is zero-based budgeting?',
        answer:
          'Zero-based budgeting means you assign every dollar of your income a specific job before the month begins. Income minus all planned expenses should equal $0. This does not mean you spend everything — it means money you want to save or invest is also explicitly planned. Cozy Budget tracks your "Left to Budget" amount at the top of the Budget page so you always know exactly how many dollars still need a job.',
      },
      {
        question: 'Is Cozy Budget free?',
        answer:
          'Yes — Cozy Budget is completely free. There are no premium tiers, subscription fees, or paywalls. All features are available to every user.',
      },
      {
        question: 'Can I use Cozy Budget offline?',
        answer:
          'Cozy Budget is a Progressive Web App (PWA), so it caches your most recent data locally. You can read your budget figures and transaction history while offline. New transactions and edits will sync automatically the next time your device has an internet connection.',
      },
    ],
  },
  {
    title: 'Managing Your Budget',
    items: [
      {
        question: 'How do I create a monthly budget?',
        answer: [
          'Cozy Budget automatically creates a new budget for the current month when you first log in during that month.',
          'Use the month picker at the top of the Budget page to navigate between months.',
          'To start a future month, switch to that month and confirm the creation prompt.',
        ],
      },
      {
        question: 'How is "Left to Budget" calculated?',
        answer:
          '"Left to Budget" = Total Planned Income − Total Planned Expenses. It is shown at the top of the Budget page. A positive number means you still have unassigned income. A negative number means your planned expenses exceed your income — you need to reduce spending somewhere to reach zero.',
      },
      {
        question: 'Can I copy a budget from a previous month?',
        answer:
          'Yes. On the Budget page, use the "Copy Previous Budget" option from the month menu. This duplicates all budget item planned amounts from the prior month into the current month. Actual transactions are never copied — only the planned amounts.',
      },
      {
        question: 'How do I add a budget line item (planned amount)?',
        answer: [
          'Open the Budget page and find the category you want to plan for.',
          'Click the "+" or "Add Item" button inside the category.',
          'Enter a description and the planned dollar amount, then save.',
        ],
      },
      {
        question: 'What is the Giving category and why can I not delete it?',
        answer:
          'Giving is a top-level predefined category that cannot be removed. This follows the EveryDollar convention of treating charitable giving as a first-class budget item so it is never accidentally forgotten in a budget plan.',
      },
      {
        question: 'What happens when I go over budget in a category?',
        answer:
          'Cozy Budget alerts you in two stages: when spending in a category reaches 90% of its planned amount, you will see a warning. When spending exceeds 100%, the category is highlighted in red and you will see a danger alert. No transactions are blocked — the alert is informational.',
      },
    ],
  },
  {
    title: 'Tracking Transactions',
    items: [
      {
        question: 'How do I record a transaction?',
        answer: [
          'Navigate to the Budget page and click a budget line item, or go to the Transactions section.',
          'Click "Add Transaction".',
          'Select whether it is income or an expense, choose the linked budget item, enter the amount and date, and optionally add a note.',
          'Click "Save" — the transaction is immediately reflected in your budget progress.',
        ],
      },
      {
        question: 'What is the difference between income and expense transactions?',
        answer:
          'Income transactions represent money received (paycheck, freelance payment, etc.) and count toward your total monthly income. Expense transactions represent money spent and are deducted from the planned amount in their linked budget category.',
      },
      {
        question: 'How do I edit or delete a transaction?',
        answer:
          'Find the transaction in the Transactions list or within the budget item detail view. Click the pencil icon to edit or the trash icon to delete it. Deleting a transaction immediately adjusts the budget progress for its linked category.',
      },
      {
        question: 'Can I add a note to a transaction?',
        answer:
          'Yes. Every transaction has an optional "Note" field where you can record merchant names, descriptions, or any other relevant detail.',
      },
    ],
  },
  {
    title: 'Recurring Items',
    items: [
      {
        question: 'What are recurring items?',
        answer:
          'Recurring items are transaction templates for expenses or income that repeat every month — such as rent, a streaming subscription, or a monthly paycheck. They save you from entering the same transaction manually each month.',
      },
      {
        question: 'How do I set up a recurring item?',
        answer: [
          'Go to the Recurring page from the navigation menu.',
          'Click "Add Recurring Item".',
          'Fill in the name, amount, day of the month it occurs, and the budget item it should be linked to.',
          'Save — it will auto-generate a transaction in that budget item every month going forward.',
        ],
      },
      {
        question: 'When do recurring transactions get created?',
        answer:
          'When you open a new month\'s budget for the first time, Cozy Budget checks your recurring items and automatically creates the corresponding transactions for that month. If a recurring item already has a matching transaction for the month, no duplicate is created.',
      },
      {
        question: 'Can I skip or pause a recurring item?',
        answer:
          'You can delete the auto-generated transaction for a specific month without affecting the recurring template. To permanently stop a recurring item, delete it from the Recurring page.',
      },
    ],
  },
  {
    title: 'Savings Goals',
    items: [
      {
        question: 'How do I create a savings goal?',
        answer: [
          'Go to the Savings page.',
          'Click "Add Goal".',
          'Enter the goal name (e.g., "Emergency Fund"), the target amount, and an optional target date.',
          'Save — your goal appears on the Savings page with a progress bar.',
        ],
      },
      {
        question: 'How do I add money to a savings goal?',
        answer:
          'Open the goal on the Savings page and click "Add Contribution". Enter the amount and date of the contribution. The progress bar and current total update immediately.',
      },
      {
        question: 'What happens when I reach my savings goal?',
        answer:
          'The goal is marked as complete and displayed with a success state. You can choose to archive it or keep it visible as motivation. Completed goals no longer appear in the active list by default.',
      },
      {
        question: 'Should savings contributions also appear as budget transactions?',
        answer:
          'Yes — best practice is to create a "Savings" budget item in your monthly budget and record your monthly contribution as a transaction there. Link it to the relevant savings goal contribution so your zero-based budget accurately reflects money moved to savings.',
      },
    ],
  },
  {
    title: 'Debt Tracking',
    items: [
      {
        question: 'How do I add a debt?',
        answer: [
          'Go to the Debt page.',
          'Click "Add Debt".',
          'Enter the debt name (e.g., "Car Loan"), current balance, interest rate, and minimum monthly payment.',
          'Save — the debt appears in your debt list ordered by balance.',
        ],
      },
      {
        question: 'What is the debt snowball method?',
        answer:
          'The debt snowball method has you pay off debts from smallest balance to largest, regardless of interest rate. Each time a debt is fully paid, you roll its payment toward the next smallest debt. Cozy Budget orders your debts by remaining balance (smallest first) by default to support this approach.',
      },
      {
        question: 'Can I reorder my debts?',
        answer:
          'Yes. Use the drag handles on the Debt page to manually reorder your debts if you prefer a different payoff sequence (such as highest interest rate first — the "debt avalanche" method).',
      },
      {
        question: 'How do I record a debt payment?',
        answer: [
          'Open the debt on the Debt page and click "Add Payment".',
          'Enter the payment amount and date.',
          'Save — the remaining balance updates automatically and is reflected in your debt payoff progress chart.',
        ],
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        question: 'What reports are available in Cozy Budget?',
        answer: [
          'Spending Breakdown — a pie chart showing expenses by category for the selected month.',
          'Planned vs. Actual — a bar chart comparing what you planned to spend vs. what you actually spent per category.',
          'Income vs. Expenses — a line chart showing monthly income and spending trends over several months.',
        ],
      },
      {
        question: 'How do I change the month or period shown in a report?',
        answer:
          'Use the month selector at the top of the Reports page to choose the month you want to analyze. The charts update automatically.',
      },
      {
        question: 'Can I export my data or download a report?',
        answer:
          'You can download this FAQ as a PDF using the button on this page. Full data export features are on the roadmap for a future update.',
      },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      {
        question: 'How do I change my account details?',
        answer:
          'Go to the Settings page from the navigation menu. You can update your name and email address there. Password changes are handled through the same page.',
      },
      {
        question: 'How do I add a custom budget category?',
        answer: [
          'Go to the Settings page and scroll to the Categories section.',
          'Click "Add Category" and choose whether it is an income or expense category.',
          'Enter a name and save. Your custom category will appear as an option when adding budget items.',
        ],
      },
      {
        question: 'Can I rename or delete a category?',
        answer:
          'You can rename any category, including predefined ones except "Giving". You can delete custom categories, but predefined categories cannot be deleted. Deleting a category will remove it from future budgets — existing historical budget items in that category remain intact.',
      },
      {
        question: 'How do I install Cozy Budget on my phone or computer?',
        answer: [
          'Open Cozy Budget in your browser. An "Install App" banner will appear on your first visit.',
          'On mobile (iOS): tap the Share button in Safari, then "Add to Home Screen".',
          'On mobile (Android): tap the menu button in Chrome, then "Add to Home screen" or "Install app".',
          'On desktop (Chrome/Edge): click the install icon in the address bar.',
          'Once installed, Cozy Budget opens as a standalone app without browser chrome.',
        ],
      },
      {
        question: 'How do I sign out?',
        answer:
          'Go to the Settings page and click the "Sign Out" button at the bottom of the page. You will be returned to the login screen.',
      },
    ],
  },
]

// ─── Print styles injected via a <style> tag ─────────────────────────────────

const printStyles = `
@media print {
  body * { visibility: hidden !important; }
  #faq-print-region, #faq-print-region * { visibility: visible !important; }
  #faq-print-region { position: absolute; inset: 0; padding: 2rem; }
  .faq-print-answer { display: block !important; }
  .faq-toggle-icon { display: none !important; }
  .faq-download-btn { display: none !important; }
}
`

// ─── Page ─────────────────────────────────────────────────────────────────────

const FAQPage = () => {
  const [expandAll, setExpandAll] = useState(false)

  const handleDownloadPDF = () => {
    // Expand all items then print so all content is visible in the PDF
    setExpandAll(true)
    // Allow state to flush before opening the print dialog
    setTimeout(() => window.print(), 150)
  }

  return (
    <>
      <style>{printStyles}</style>

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8" id="faq-print-region">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to know about using Cozy Budget.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="faq-download-btn shrink-0 gap-2"
            aria-label="Download FAQ as PDF"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </Button>
        </div>

        {/* Quick-jump links */}
        <nav aria-label="FAQ sections" className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Jump to section
          </p>
          <div className="flex flex-wrap gap-2">
            {faqSections.map((section) => (
              <a
                key={section.title}
                href={`#faq-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
                className={cn(
                  'rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/70',
                  'transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                )}
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Expand / Collapse all */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setExpandAll((prev) => !prev)}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {expandAll ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {faqSections.map((section) => (
            <ExpandableFAQSection key={section.title} section={section} forceExpand={expandAll} />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-xs text-muted-foreground">
          Still have questions? Reach out at{' '}
          <a
            href="mailto:support@cozybudget.app"
            className="text-primary underline underline-offset-2"
          >
            support@cozybudget.app
          </a>
        </p>
      </div>
    </>
  )
}

// ─── Expandable section wrapper (honours forceExpand) ────────────────────────

const ExpandableFAQItem = ({
  item,
  forceExpand,
}: {
  item: FAQItem
  forceExpand: boolean
}) => {
  const [localOpen, setLocalOpen] = useState(false)
  const open = forceExpand || localOpen

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setLocalOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground">{item.question}</span>
        <span className="faq-toggle-icon">
          {open ? (
            <ChevronUp
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </span>
      </button>

      {open && (
        <div className="faq-print-answer pb-4 pr-8 text-sm text-muted-foreground">
          {Array.isArray(item.answer) ? (
            <ol className="list-decimal space-y-1 pl-5">
              {item.answer.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>{item.answer}</p>
          )}
        </div>
      )}
    </div>
  )
}

const ExpandableFAQSection = ({
  section,
  forceExpand,
}: {
  section: FAQSection
  forceExpand: boolean
}) => (
  <section aria-labelledby={`faq-${section.title.replace(/\s+/g, '-').toLowerCase()}`}>
    <h2
      id={`faq-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
      className="mb-3 text-base font-semibold text-foreground"
    >
      {section.title}
    </h2>
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="px-6 py-0">
        {section.items.map((item) => (
          <ExpandableFAQItem key={item.question} item={item} forceExpand={forceExpand} />
        ))}
      </CardContent>
    </Card>
  </section>
)

export default FAQPage
