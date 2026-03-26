import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useDebts,
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
  useDebtPayments,
  useRecordPayment,
  useReorderDebts,
} from '@/hooks/useDebts'
import { formatCurrency } from '@/lib/formatters'
import type { Debt } from '@cozy-budget/shared'

// ---- form schemas ----
const debtFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  originalBalanceDollars: z.string().min(1, 'Required'),
  currentBalanceDollars: z.string().min(1, 'Required'),
  interestRate: z.string().min(1, 'Required'),
  minimumPaymentDollars: z.string().min(1, 'Required'),
})
type DebtForm = z.infer<typeof debtFormSchema>

const paymentFormSchema = z.object({
  amountDollars: z.string().min(1, 'Amount is required'),
  paymentDate: z.string().min(1, 'Date is required'),
})
type PaymentForm = z.infer<typeof paymentFormSchema>

const today = () => new Date().toISOString().slice(0, 10)

const paidPct = (d: Debt) =>
  d.originalBalance > 0
    ? Math.min(100, Math.round(((d.originalBalance - d.currentBalance) / d.originalBalance) * 100))
    : 100

// ---- payment history sub-component ----
const PaymentHistory = ({ debtId }: { debtId: string }) => {
  const { data: payments, isLoading } = useDebtPayments(debtId)
  if (isLoading) return <Skeleton className="h-10 w-full" />
  if (!payments || payments.length === 0)
    return <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
  return (
    <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
      {payments.map((p) => (
        <li key={p.id} className="flex justify-between text-muted-foreground">
          <span>{p.paymentDate}</span>
          <span className="font-medium text-foreground">{formatCurrency(p.amount)}</span>
        </li>
      ))}
    </ul>
  )
}

// ---- debt card ----
const DebtCard = ({
  debt,
  index,
  total,
  onEdit,
  onDelete,
  onPay,
  onMoveUp,
  onMoveDown,
}: {
  debt: Debt
  index: number
  total: number
  onEdit: (d: Debt) => void
  onDelete: (d: Debt) => void
  onPay: (d: Debt) => void
  onMoveUp: () => void
  onMoveDown: () => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const progress = paidPct(debt)
  const paid = debt.originalBalance - debt.currentBalance

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        {/* header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="h-4 w-4 shrink-0 text-[#D4845A]" />
            <span className="font-semibold truncate text-foreground">{debt.name}</span>
            {debt.currentBalance === 0 && (
              <span className="text-xs bg-[#5A8C6A]/10 text-[#5A8C6A] px-1.5 py-0.5 rounded-full">
                Paid off!
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              disabled={index === 0}
              onClick={onMoveUp}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              disabled={index === total - 1}
              onClick={onMoveDown}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(debt)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => onDelete(debt)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* progress */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paid)} paid</span>
            <span>{progress}%</span>
            <span>{formatCurrency(debt.originalBalance)} original</span>
          </div>
        </div>

        {/* stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Balance: </span>
            <span className="font-semibold text-[#C0615A]">{formatCurrency(debt.currentBalance)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rate: </span>
            <span>{debt.interestRate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Min payment: </span>
            <span>{formatCurrency(debt.minimumPayment)}</span>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground px-0 h-auto"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 mr-1" />
            )}
            Payment history
          </Button>
          {debt.currentBalance > 0 && (
            <Button size="sm" variant="outline" onClick={() => onPay(debt)}>
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* expandable payment history */}
      {expanded && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <PaymentHistory debtId={debt.id} />
          </div>
        </>
      )}
    </div>
  )
}

// ---- main page ----
const DebtPage = () => {
  const { data: debts, isLoading } = useDebts()
  const createDebt = useCreateDebt()
  const updateDebt = useUpdateDebt()
  const deleteDebt = useDeleteDebt()
  const recordPayment = useRecordPayment()
  const reorderDebts = useReorderDebts()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null)
  const [payTarget, setPayTarget] = useState<Debt | null>(null)

  const debtForm = useForm<DebtForm>({ resolver: zodResolver(debtFormSchema) })
  const payForm = useForm<PaymentForm>({ resolver: zodResolver(paymentFormSchema) })

  const openCreate = () => {
    setEditingDebt(null)
    debtForm.reset({
      name: '',
      originalBalanceDollars: '',
      currentBalanceDollars: '',
      interestRate: '',
      minimumPaymentDollars: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (debt: Debt) => {
    setEditingDebt(debt)
    debtForm.reset({
      name: debt.name,
      originalBalanceDollars: (debt.originalBalance / 100).toFixed(2),
      currentBalanceDollars: (debt.currentBalance / 100).toFixed(2),
      interestRate: String(debt.interestRate),
      minimumPaymentDollars: (debt.minimumPayment / 100).toFixed(2),
    })
    setDialogOpen(true)
  }

  const onSubmitDebt = (values: DebtForm) => {
    const originalBalance = Math.round(parseFloat(values.originalBalanceDollars) * 100)
    const currentBalance = Math.round(parseFloat(values.currentBalanceDollars) * 100)
    const interestRate = parseFloat(values.interestRate)
    const minimumPayment = Math.round(parseFloat(values.minimumPaymentDollars) * 100)

    if (editingDebt) {
      updateDebt.mutate(
        { id: editingDebt.id, name: values.name, currentBalance, interestRate, minimumPayment },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createDebt.mutate(
        { name: values.name, originalBalance, currentBalance, interestRate, minimumPayment },
        { onSuccess: () => setDialogOpen(false) }
      )
    }
  }

  const onSubmitPayment = (values: PaymentForm) => {
    if (!payTarget) return
    const amount = Math.round(parseFloat(values.amountDollars) * 100)
    recordPayment.mutate(
      { id: payTarget.id, amount, paymentDate: values.paymentDate },
      {
        onSuccess: () => {
          setPayTarget(null)
          payForm.reset()
        },
      }
    )
  }

  const move = (index: number, direction: 'up' | 'down') => {
    if (!debts) return
    const ids = debts.map((d) => d.id)
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    ;[ids[index], ids[swapIdx]] = [ids[swapIdx], ids[index]]
    reorderDebts.mutate(ids)
  }

  // split into active / paid off
  const active = debts?.filter((d) => d.currentBalance > 0) ?? []
  const paidOff = debts?.filter((d) => d.currentBalance === 0) ?? []

  const totalOwed = active.reduce((s, d) => s + d.currentBalance, 0)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Debt Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length > 0
              ? `${formatCurrency(totalOwed)} remaining across ${active.length} debt${active.length === 1 ? '' : 's'}`
              : 'Track and pay down your debts'}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add Debt
        </Button>
      </div>

      {/* snowball note */}
      {active.length > 1 && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          Debts are ordered for snowball payoff (smallest first). Use the arrows to reorder manually.
        </p>
      )}

      {/* loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* empty */}
      {!isLoading && debts?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No debts tracked</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your debts to start the snowball payoff plan.
          </p>
          <Button className="mt-4 bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white" onClick={openCreate}>
            Add your first debt
          </Button>
        </div>
      )}

      {/* active debts */}
      {!isLoading && active.length > 0 && (
        <div className="space-y-3">
          {active.map((debt, idx) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              index={idx}
              total={active.length}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onPay={(d) => {
                setPayTarget(d)
                payForm.reset({ amountDollars: (d.minimumPayment / 100).toFixed(2), paymentDate: today() })
              }}
              onMoveUp={() => move(idx, 'up')}
              onMoveDown={() => move(idx, 'down')}
            />
          ))}
        </div>
      )}

      {/* paid off */}
      {!isLoading && paidOff.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Paid Off 🎉
          </h2>
          {paidOff.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              index={0}
              total={1}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onPay={() => {}}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            />
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDebt ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={debtForm.handleSubmit(onSubmitDebt)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="debt-name">Name</Label>
              <Input id="debt-name" placeholder="e.g. Car Loan" {...debtForm.register('name')} />
              {debtForm.formState.errors.name && (
                <p className="text-xs text-destructive">{debtForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="debt-original">Original balance ($)</Label>
                <Input
                  id="debt-original"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="15000.00"
                  disabled={!!editingDebt}
                  {...debtForm.register('originalBalanceDollars')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="debt-current">Current balance ($)</Label>
                <Input
                  id="debt-current"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="12000.00"
                  {...debtForm.register('currentBalanceDollars')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="debt-rate">Interest rate (%)</Label>
                <Input
                  id="debt-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.5"
                  {...debtForm.register('interestRate')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="debt-minpay">Min. payment ($)</Label>
                <Input
                  id="debt-minpay"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="250.00"
                  {...debtForm.register('minimumPaymentDollars')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white"
                disabled={createDebt.isPending || updateDebt.isPending}
              >
                {editingDebt ? 'Save Changes' : 'Add Debt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record payment dialog */}
      <Dialog open={!!payTarget} onOpenChange={(open) => { if (!open) setPayTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment — {payTarget?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={payForm.handleSubmit(onSubmitPayment)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">Amount ($)</Label>
              <Input
                id="pay-amount"
                type="number"
                min="0.01"
                step="0.01"
                {...payForm.register('amountDollars')}
              />
              {payForm.formState.errors.amountDollars && (
                <p className="text-xs text-destructive">
                  {payForm.formState.errors.amountDollars.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Payment date</Label>
              <Input id="pay-date" type="date" {...payForm.register('paymentDate')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayTarget(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white"
                disabled={recordPayment.isPending}
              >
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this debt and all payment history. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget)
                  deleteDebt.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DebtPage
