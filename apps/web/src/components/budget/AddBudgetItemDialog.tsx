import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@cozy-budget/shared'
import { useToast } from '@/hooks/use-toast'
import { dollarsToCents, isValidAmountInput } from '@/lib/formatters'

const schema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  plannedAmount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => isValidAmountInput(v, 0), {
      message: 'Enter a valid amount',
    }),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Categories not yet represented in this budget */
  availableCategories: Category[]
  onAdd: (categoryId: string, plannedAmountCents: number) => Promise<void>
}

const AddBudgetItemDialog = ({ open, onOpenChange, availableCategories, onAdd }: Props) => {
  const { toast } = useToast()
  const incomeCategories = availableCategories.filter((c) => c.type === 'income')
  const expenseCategories = availableCategories.filter((c) => c.type === 'expense')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    const cents = dollarsToCents(data.plannedAmount)
    try {
      await onAdd(data.categoryId, cents)
      reset()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add item',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Budget Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              {...register('categoryId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a category…</option>
              {incomeCategories.length > 0 && (
                <optgroup label="Income">
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {expenseCategories.length > 0 && (
                <optgroup label="Expenses">
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-danger">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plannedAmount">Planned Amount ($)</Label>
            <Input
              id="plannedAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('plannedAmount')}
            />
            {errors.plannedAmount && (
              <p className="text-sm text-danger">{errors.plannedAmount.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting || availableCategories.length === 0}
            >
              {isSubmitting ? 'Adding…' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddBudgetItemDialog
