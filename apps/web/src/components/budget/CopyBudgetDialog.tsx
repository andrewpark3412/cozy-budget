import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const schema = z.object({
  sourceMonth: z.coerce.number().int().min(1).max(12),
  sourceYear: z.coerce.number().int().min(2020).max(2100),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMonth: number
  currentYear: number
  onCopy: (sourceMonth: number, sourceYear: number) => Promise<void>
}

const CopyBudgetDialog = ({ open, onOpenChange, currentMonth, currentYear, onCopy }: Props) => {
  const { toast } = useToast()

  // Default to previous month
  const defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const defaultYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sourceMonth: defaultMonth, sourceYear: defaultYear },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await onCopy(data.sourceMonth, data.sourceYear)
      onOpenChange(false)
      toast({ title: 'Budget copied', description: 'Planned amounts have been copied.' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to copy budget',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Copy from Previous Month</DialogTitle>
          <DialogDescription>
            Select the month to copy planned amounts from. Existing items in this
            month will be replaced.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="sourceMonth">Month</Label>
              <select
                id="sourceMonth"
                {...register('sourceMonth')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {MONTHS.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-28 space-y-1.5">
              <Label htmlFor="sourceYear">Year</Label>
              <select
                id="sourceYear"
                {...register('sourceYear')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Copying…' : 'Copy Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CopyBudgetDialog
