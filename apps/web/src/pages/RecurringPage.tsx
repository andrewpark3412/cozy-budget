import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { useToast } from '@/hooks/use-toast'
import {
  useRecurringItems,
  useCreateRecurringItem,
  useUpdateRecurringItem,
  useDeleteRecurringItem,
  type RecurringItemWithCategory,
} from '@/hooks/useRecurringItems'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/lib/formatters'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  categoryId: z.string().uuid('Select a category'),
  amount: z
    .string()
    .min(1)
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be positive'),
  dayOfMonth: z.coerce.number().int().min(1).max(31),
})

type FormValues = z.infer<typeof schema>

const ORDINALS = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
  '11th','12th','13th','14th','15th','16th','17th','18th','19th','20th',
  '21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st']

const RecurringPage = () => {
  const { toast } = useToast()
  const { data: items = [], isLoading } = useRecurringItems()
  const { data: categories = [] } = useCategories()

  const createItem = useCreateRecurringItem()
  const updateItem = useUpdateRecurringItem()
  const deleteItem = useDeleteRecurringItem()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringItemWithCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dayOfMonth: 1 },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ dayOfMonth: 1, name: '', amount: '', categoryId: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: RecurringItemWithCategory) => {
    setEditing(item)
    reset({
      name: item.name,
      categoryId: item.categoryId,
      amount: (item.amount / 100).toFixed(2),
      dayOfMonth: item.dayOfMonth,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: FormValues) => {
    const amountCents = Math.round(parseFloat(data.amount) * 100)
    try {
      if (editing) {
        await updateItem.mutateAsync({
          id: editing.id,
          name: data.name,
          categoryId: data.categoryId,
          amount: amountCents,
          dayOfMonth: data.dayOfMonth,
        })
        toast({ title: 'Updated', description: `${data.name} has been updated.` })
      } else {
        await createItem.mutateAsync({
          name: data.name,
          categoryId: data.categoryId,
          amount: amountCents,
          dayOfMonth: data.dayOfMonth,
        })
        toast({ title: 'Created', description: `${data.name} will auto-apply each month.` })
      }
      setDialogOpen(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (item: RecurringItemWithCategory) => {
    await updateItem.mutateAsync({ id: item.id, isActive: !item.isActive })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteItem.mutateAsync(deleteId, {
      onError: (err) => {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete',
          variant: 'destructive',
        })
      },
    })
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Recurring Items</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Auto-applied to each new budget month
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-primary hover:bg-primary/90"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No recurring items</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add fixed expenses (rent, phone bill, etc.) and they'll be auto-added each month.
          </p>
          <Button
            size="sm"
            className="mt-4 bg-primary hover:bg-primary/90"
            onClick={openCreate}
          >
            Add First Recurring Item
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-sm divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${item.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.category.name} · {ORDINALS[item.dayOfMonth - 1]} of month
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(item.amount)}
              </span>

              <Switch
                checked={item.isActive}
                onCheckedChange={() => handleToggleActive(item)}
                aria-label={`Toggle ${item.name} ${item.isActive ? 'off' : 'on'}`}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => openEdit(item)}
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-danger"
                onClick={() => setDeleteId(item.id)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Recurring Item' : 'New Recurring Item'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                placeholder="e.g. Netflix, Rent, Phone Bill"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r-category">Category</Label>
              <select
                id="r-category"
                {...register('categoryId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-danger">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="r-amount">Amount ($)</Label>
                <Input
                  id="r-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-xs text-danger">{errors.amount.message}</p>
                )}
              </div>

              <div className="w-32 space-y-1.5">
                <Label htmlFor="r-day">Day of Month</Label>
                <Input
                  id="r-day"
                  type="number"
                  min="1"
                  max="31"
                  {...register('dayOfMonth')}
                />
                {errors.dayOfMonth && (
                  <p className="text-xs text-danger">{errors.dayOfMonth.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This recurring item will no longer be auto-applied to new months.
              Transactions already created will not be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger hover:bg-danger/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RecurringPage
