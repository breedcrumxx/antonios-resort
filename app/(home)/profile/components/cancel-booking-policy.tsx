'use client'

import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Textarea } from "@/app/components/ui/textarea"
import { cancelBooking } from "@/lib/actions/booking-actions/cancel-booking"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from 'antd'
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod'
import { cancellationReasons, reschedulingReasons } from "@/lib/utils/configurable-data"
import { RejectionAndCancellationForm } from "@/app/admin/(admin)/(dashboard)/bookings/booking-components/rejection-form"
import RefundBookingForm from "./refund-booking-form"
import { refunds, user } from "@/lib/zod/z-schema"
import CancellationPolicyContent from "./cancellation-policy-content"

export default function CancelBookingPolicy({
  dataid,
  bookingid,
  close,
  adminRequest,
  client
}: {
  dataid: string,
  bookingid: string,
  close: () => void,
  client?: z.infer<typeof user>,
  adminRequest?: boolean
}) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [agreementModal, setAgreementModal] = useState<boolean>(false)
  const [immediateRefund, setImmediateRefund] = useState<boolean>(false)
  const [requestRefund, setRequestRefund] = useState<boolean>(false)
  const [reasons, setReasons] = useState<{ name: string, value: string }[]>(adminRequest ? reschedulingReasons : cancellationReasons)

  // values
  const [agree, setAgree] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")
  const [refundData, setRefundData] = useState<z.infer<typeof refunds> | null>(null)

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

    // check if the agreement is solved, else show the agreement modal
    if (!agree) {
      setAgreementModal(true)
      return
    }

    // search the appropriate reason
    let reason = cancellationReasons.find((item) => item.name == values.reason)

    if (!reason) { // in case the reason is others, then set the reason to what the admin typed
      reason = { name: "Other Reasons", value: values.reason }
    }

    setLoading(true)
    const response = await cancelBooking(dataid, reason.value)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured while processing your request!")
      return
    } else if (response.status == 404) {
      message.info("Your booking went missing!")
    }

    if (!adminRequest) {
      setRefundData(response.data)
      message.success("Your booking has been cancelled!")
      setImmediateRefund(true)
      return
    }

    router.refresh()
    close()
    return
  }

  return (
    <>
      {
        !immediateRefund ? (
          <>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>Please provide your reason for cancelling your booking.</DialogDescription>
            </DialogHeader>
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Cancellation reason</FormLabel>
                        <Select onValueChange={(e) => {
                          setReason(e)
                          field.onChange(e)
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a proper reason for cancellation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {
                                reasons.map((item, i) => (
                                  <SelectItem value={item.name} key={i}>{item.name}</SelectItem>
                                ))
                              }
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <FormDescription>Please choose a proper reason for cancellation of your booking.</FormDescription>
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
                      <p className="error text-sm">Please provide a reason to be sent to the admins.</p>
                    )
                  }
                  <div className="flex gap-4 justify-end mt-4">
                    <Button type="button" variant={"outline"} onClick={() => close()}>Abort</Button>
                    <Button variant={"destructive"}>Cancel booking</Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : !requestRefund && (
          <>
            <DialogHeader>
              <DialogTitle>Booking Cancelled</DialogTitle>
              <DialogDescription>You successfully cancelled your booking. Do you want to request a refund for this booking right away?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant={"ghost"} onClick={() => close()}>Later</Button>
              <Button className="bg-prm" onClick={() => setRequestRefund(true)}>Request now</Button>
            </DialogFooter>
          </>
        )
      }
      {
        requestRefund && refundData && client && (
          <RefundBookingForm
            data={{ id: dataid, refund: refundData, user: client, status: "Cancelled" }}
            bookingid={bookingid}
            close={() => close()}
          />
        )
      }

      <Dialog open={agreementModal} onOpenChange={(e) => setAgreementModal(false)}>
        <DialogContent className={clsx("", { "min-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col": !adminRequest })}>
          {
            !adminRequest ? (
              <>
                <DialogHeader>
                  <DialogTitle>CANCELLATION AND REFUND POLICY</DialogTitle>
                  <DialogDescription>PLEASE READ CAREFULLY. BY CHECKING THE BOX BELOW, YOU UNDERSTAND THE POLICY AND RULES AND WISH TO PROCEED TO CANCELLATION OF YOUR BOOKING.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-scroll scroll relative">
                  <div className='h-max w-full space-y-2 px-5 pb-5 text-justify'>
                    <CancellationPolicyContent>
                      <>
                        <br />
                        <div className='flex items-center px-5 gap-2'>
                          <Checkbox onCheckedChange={(e) => setAgree(e as boolean)} className='max-h w-4' />
                          <p>I have read and understood the cancellation policy. By checking this box, I acknowledge and agree that I cannot undo this action and accept the terms and conditions outlined above.</p>
                        </div>
                      </>
                    </CancellationPolicyContent>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>CANCELLATION OF GUEST BOOKING</DialogTitle>
                  <DialogDescription>
                    <p>Please ensure that this operation is intended and note that it is not reversible.</p>
                  </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col items-center px-5 gap-2'>
                  <ul className="list-disc text-sm">
                    <li>Please ensure that this operation is intended and note that it is not reversible.</li>
                    <li>By proceeding, you are confirming that the guest booking will be permanently canceled, and the guest will not be able to reinstate this booking. Any associated payments or deposits may be subject to the cancellation policy.</li>
                    <li>Please make sure you have reviewed the booking details and communicated with the guest if necessary.</li>
                  </ul>
                  <div className="flex gap-2 items-center">
                    <Checkbox onCheckedChange={(e) => setAgree(e as boolean)} className='max-h w-4' />
                    <p>I understood and wish to proceed to cancelation.</p>
                  </div>
                </div>
              </>
            )
          }
          <DialogFooter className=''>
            <Button className={clsx('px-6', { "bg-prm": !adminRequest })} onClick={() => setAgreementModal(false)} disabled={!agree}>Agree and continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Processing, please wait..." />
    </>
  )
}