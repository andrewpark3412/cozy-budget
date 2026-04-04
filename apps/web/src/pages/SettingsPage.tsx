import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signOutAndClear, useSession } from '@/lib/auth-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Trash2, Plus, RefreshCw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'
import type { Category } from '@cozy-budget/shared'

// ─── Forms ────────────────────────────────────────────────────────────────────

const addCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['income', 'expense']),
})
type AddCategoryForm = z.infer<typeof addCategorySchema>

const renameCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
})
type RenameCategoryForm = z.infer<typeof renameCategorySchema>

// ─── Inline rename row ────────────────────────────────────────────────────────

const RenameRow = ({
  category,
  onDone,
}: {
  category: Category
  onDone: () => void
}) => {
  const { toast } = useToast()
  const updateCategory = useUpdateCategory()
  const { register, handleSubmit, formState } = useForm<RenameCategoryForm>({
    resolver: zodResolver(renameCategorySchema),
    defaultValues: { name: category.name },
  })

  const onSubmit = async (values: RenameCategoryForm) => {
    await updateCategory.mutateAsync(
      { id: category.id, name: values.name },
      {
        onSuccess: () => {
          toast({ title: 'Category renamed' })
          onDone()
        },
        onError: (err) => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' })
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 py-1">
      <Input {...register('name')} className="h-8 text-sm" autoFocus />
      {formState.errors.name && (
        <span className="text-xs text-destructive">{formState.errors.name.message}</span>
      )}
      <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
        <Check className="h-4 w-4 text-primary" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0"
        onClick={onDone}
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </Button>
    </form>
  )
}

// ─── Category row ─────────────────────────────────────────────────────────────

const CategoryRow = ({ category }: { category: Category }) => {
  const { toast } = useToast()
  const deleteCategory = useDeleteCategory()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    await deleteCategory.mutateAsync(category.id, {
      onSuccess: () => toast({ title: 'Category deleted' }),
      onError: (err) =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    })
    setConfirmDelete(false)
  }

  if (editing) {
    return <RenameRow category={category} onDone={() => setEditing(false)} />
  }

  return (
    <>
      <div className="flex items-center gap-2 py-1.5">
        <span className="flex-1 text-sm text-foreground">{category.name}</span>
        <Badge variant="outline" className="text-[10px]">
          {category.type}
        </Badge>
        {!category.isSystem && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label={`Rename ${category.name}`}
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              aria-label={`Delete ${category.name}`}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {category.isSystem && (
          <span className="text-xs italic text-muted-foreground">system</span>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Budget items using it may be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [addOpen, setAddOpen] = useState(false)

  const addForm = useForm<AddCategoryForm>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: { name: '', type: 'expense' },
  })

  const handleSignOut = async () => {
    await signOutAndClear()
    navigate('/login')
  }

  const handleAddCategory = async (values: AddCategoryForm) => {
    await createCategory.mutateAsync(values, {
      onSuccess: () => {
        toast({ title: 'Category added' })
        setAddOpen(false)
        addForm.reset()
      },
      onError: (err) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      },
    })
  }

  const systemCategories = categories?.filter((c) => c.isSystem) ?? []
  const customCategories = categories?.filter((c) => !c.isSystem) ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Signed in as{' '}
            <span className="font-medium text-foreground">{session?.user.email}</span>
          </p>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            to="/recurring"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Manage Recurring Items
          </Link>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <>
              {customCategories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Custom
                  </p>
                  <div className="divide-y divide-border rounded-lg border px-3">
                    {customCategories.map((c) => (
                      <CategoryRow key={c.id} category={c} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Built-in
                </p>
                <div className="divide-y divide-border rounded-lg border px-3">
                  {systemCategories.map((c) => (
                    <CategoryRow key={c.id} category={c} />
                  ))}
                </div>
              </div>

              {categories?.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No categories yet.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add category dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={addForm.handleSubmit(handleAddCategory)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="cat-name">
                Name
              </label>
              <Input
                id="cat-name"
                placeholder="e.g. Hobbies"
                {...addForm.register('name')}
              />
              {addForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {addForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="cat-type">
                Type
              </label>
              <Select
                defaultValue="expense"
                onValueChange={(v) =>
                  addForm.setValue('type', v as 'income' | 'expense')
                }
              >
                <SelectTrigger id="cat-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? 'Adding…' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsPage
