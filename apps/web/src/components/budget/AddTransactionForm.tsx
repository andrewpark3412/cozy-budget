import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dollarsToCents, isValidAmountInput, todayISO } from '@/lib/formatters'

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => isValidAmountInput(v, 0.01), 'Must be a positive number'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required'),
  note: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onAdd: (amountCents: number, date: string, note: string | null) => Promise<void>
}

const AddTransactionForm = ({ onAdd }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayISO(), note: '' },
  })

  const onSubmit = async (data: FormValues) => {
    const cents = dollarsToCents(data.amount)
    await onAdd(cents, data.date, data.note?.trim() || null)
    reset({ date: todayISO(), note: '' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="tx-amount">Amount ($)</Label>
          <Input
            id="tx-amount"
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

        <div className="w-36 space-y-1">
          <Label htmlFor="tx-date">Date</Label>
          <Input id="tx-date" type="date" {...register('date')} />
          {errors.date && (
            <p className="text-xs text-danger">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="tx-note">Note (optional)</Label>
        <Input
          id="tx-note"
          type="text"
          placeholder="e.g. Whole Foods"
          maxLength={500}
          {...register('note')}
        />
      </div>

      <Button
        type="submit"
        size="sm"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding…' : 'Add Transaction'}
      </Button>
    </form>
  )
}

export default AddTransactionForm
