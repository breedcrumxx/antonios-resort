'use client'

import { Button } from '@/app/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import { useToast } from '@/app/components/ui/use-toast'
import { useReload } from '@/app/providers/reloader'
import { rejectBooking } from '@/lib/actions/booking-actions/reject-booking'
import { rejectionReasons } from '@/lib/utils/configurable-data'
import FullCoverLoading from '@/lib/utils/full-cover-loading'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

export const RejectionAndCancellationForm = z.object({
  reason: z.string().min(1, { message: "Please provide a reason!" })
    .min(10, { message: "Elaborate your reason to avoid confusion!" })
})

export default function RejectionForm({ data, close }: { data: BookingDataTable, close: () => void }) {

  // context 
  const { toast } = useToast()
  const { setReload } = useReload()

  // states
  const [reason, setReason] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof RejectionAndCancellationForm>>({
    resolver: zodResolver(RejectionAndCancellationForm),
    defaultValues: {
      reason: ""
    }
  })

  async function onSubmit(values: z.infer<typeof RejectionAndCancellationForm>) {
    if (values.reason === "Other Reasons") {
      setError(true)
      return
    }

    setError(false)
    setLoading(true)

    // search the appropriate reason
    let reason = rejectionReasons.find((item) => item.name == values.reason)

    if (!reason) { // in case the reason is others, then set the reason to what the admin typed
      reason = { name: "Other Reasons", value: values.reason }
    }

    const response = await rejectBooking(data.id, reason)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: 'An error occured!',
        description: "An error occured, unable to reject this booking.",
        variant: "destructive"
      })
      return
    }

    setReload(true)
    toast({
      title: 'Rejected a booking.',
      description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
    })
    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Rejection of booking</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Rejection reason</FormLabel>
                <Select onValueChange={(e) => {
                  setReason(e)
                  field.onChange(e)
                }}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a proper reason for rejection" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {
                        rejectionReasons.map((item, i) => (
                          <SelectItem value={item.name} key={i}>{item.name}</SelectItem>
                        ))
                      }
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription>Please choose a proper reason for this rejection. This will be sent to the Guest&apos;s email after submition.</FormDescription>
              </FormItem>
            )}
          />
          {
            reason == "Other Reasons" && (
              <Textarea className={clsx("", { "border-red-500": error })} onChange={(e) => form.setValue('reason', e.target.value)} placeholder="Please provide your reason..." />
            )
          }
          {
            error && (
              <p className="error text-sm">Please provide a reason to be sent to the Guest email!</p>
            )
          }
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" type="button" onClick={() => close()}>Cancel</Button>
            <Button variant={"destructive"} className="hover:bg-red-500 hover:text-white">Reject</Button>
          </div>
        </form>
      </Form>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Processing, please wait..." />
    </>
  )
}