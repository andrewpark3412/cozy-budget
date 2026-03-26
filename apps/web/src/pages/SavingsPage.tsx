import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, PiggyBank, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Progress } from '@/components/ui/progress'
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useDeleteSavingsGoal,
  useContributeToGoal,
} from '@/hooks/useSavingsGoals'
import { formatCurrency } from '@/lib/formatters'
import type { SavingsGoal } from '@cozy-budget/shared'

// --------------- form schemas ---------------
const goalFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmountDollars: z.string().min(1, 'Target amount is required'),
  targetDate: z.string().optional(),
})
type GoalForm = z.infer<typeof goalFormSchema>

const contributeFormSchema = z.object({
  amountDollars: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
})
type ContributeForm = z.infer<typeof contributeFormSchema>

// --------------- helpers ---------------
const pct = (goal: SavingsGoal) =>
  goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0

const today = () => new Date().toISOString().slice(0, 10)

// --------------- sub-components ---------------
const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: SavingsGoal
  onEdit: (g: SavingsGoal) => void
  onDelete: (g: SavingsGoal) => void
  onContribute: (g: SavingsGoal) => void
}) => {
  const progress = pct(goal)
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {goal.isComplete ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5A8C6A]" />
          ) : (
            <PiggyBank className="h-5 w-5 shrink-0 text-[#7C9A7E]" />
          )}
          <span className="font-semibold truncate text-foreground">{goal.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(goal)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(goal)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(goal.currentAmount)} saved</span>
          <span>{progress}%</span>
          <span>{formatCurrency(goal.targetAmount)} goal</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {goal.isComplete ? (
            <span className="text-[#5A8C6A] font-medium">Goal reached! 🎉</span>
          ) : (
            <span>{formatCurrency(remaining)} to go</span>
          )}
          {goal.targetDate && (
            <span className="ml-2 text-xs">· by {goal.targetDate}</span>
          )}
        </div>
        {!goal.isComplete && (
          <Button size="sm" variant="outline" onClick={() => onContribute(goal)}>
            Add Funds
          </Button>
        )}
      </div>
    </div>
  )
}

// --------------- main page ---------------
const SavingsPage = () => {
  const { data: goals, isLoading } = useSavingsGoals()
  const createGoal = useCreateSavingsGoal()
  const updateGoal = useUpdateSavingsGoal()
  const deleteGoal = useDeleteSavingsGoal()
  const contribute = useContributeToGoal()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)

  const goalForm = useForm<GoalForm>({ resolver: zodResolver(goalFormSchema) })
  const contributeForm = useForm<ContributeForm>({ resolver: zodResolver(contributeFormSchema) })

  const openCreate = () => {
    setEditingGoal(null)
    goalForm.reset({ name: '', targetAmountDollars: '', targetDate: '' })
    setDialogOpen(true)
  }

  const openEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    goalForm.reset({
      name: goal.name,
      targetAmountDollars: (goal.targetAmount / 100).toFixed(2),
      targetDate: goal.targetDate ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmitGoal = (values: GoalForm) => {
    const targetAmount = Math.round(parseFloat(values.targetAmountDollars) * 100)
    const targetDate = values.targetDate || null

    if (editingGoal) {
      updateGoal.mutate(
        { id: editingGoal.id, name: values.name, targetAmount, targetDate },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createGoal.mutate(
        { name: values.name, targetAmount, targetDate },
        { onSuccess: () => setDialogOpen(false) }
      )
    }
  }

  const onContribute = (values: ContributeForm) => {
    if (!contributeTarget) return
    const amount = Math.round(parseFloat(values.amountDollars) * 100)
    contribute.mutate(
      { id: contributeTarget.id, amount, date: values.date },
      {
        onSuccess: () => {
          setContributeTarget(null)
          contributeForm.reset()
        },
      }
    )
  }

  const active = goals?.filter((g) => !g.isComplete) ?? []
  const completed = goals?.filter((g) => g.isComplete) ?? []

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Savings Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track progress toward your financial targets</p>
        </div>
        <Button onClick={openCreate} className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white">
          <Plus className="h-4 w-4 mr-1" />
          New Goal
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Active goals */}
      {!isLoading && active.length === 0 && completed.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <PiggyBank className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No savings goals yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a goal to start tracking your progress.
          </p>
          <Button className="mt-4 bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white" onClick={openCreate}>
            Create your first goal
          </Button>
        </div>
      )}

      {!isLoading && active.length > 0 && (
        <div className="space-y-3">
          {active.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onContribute={(goal) => {
                setContributeTarget(goal)
                contributeForm.reset({ amountDollars: '', date: today() })
              }}
            />
          ))}
        </div>
      )}

      {/* Completed goals */}
      {!isLoading && completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed
          </h2>
          {completed.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onContribute={() => {}}
            />
          ))}
        </div>
      )}

      {/* Create / Edit goal dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-name">Goal name</Label>
              <Input id="goal-name" placeholder="e.g. Emergency Fund" {...goalForm.register('name')} />
              {goalForm.formState.errors.name && (
                <p className="text-xs text-destructive">{goalForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-amount">Target amount ($)</Label>
              <Input
                id="goal-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="5000.00"
                {...goalForm.register('targetAmountDollars')}
              />
              {goalForm.formState.errors.targetAmountDollars && (
                <p className="text-xs text-destructive">
                  {goalForm.formState.errors.targetAmountDollars.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-date">Target date (optional)</Label>
              <Input id="goal-date" type="date" {...goalForm.register('targetDate')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white"
                disabled={createGoal.isPending || updateGoal.isPending}
              >
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute dialog */}
      <Dialog
        open={!!contributeTarget}
        onOpenChange={(open) => {
          if (!open) setContributeTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Funds — {contributeTarget?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={contributeForm.handleSubmit(onContribute)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contrib-amount">Amount ($)</Label>
              <Input
                id="contrib-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="100.00"
                {...contributeForm.register('amountDollars')}
              />
              {contributeForm.formState.errors.amountDollars && (
                <p className="text-xs text-destructive">
                  {contributeForm.formState.errors.amountDollars.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contrib-date">Date</Label>
              <Input id="contrib-date" type="date" {...contributeForm.register('date')} />
              {contributeForm.formState.errors.date && (
                <p className="text-xs text-destructive">{contributeForm.formState.errors.date.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContributeTarget(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white"
                disabled={contribute.isPending}
              >
                Add Funds
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
              This will permanently remove this savings goal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteGoal.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
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

export default SavingsPage
