'use client'

import { Button } from "@/app/components/ui/button"
import { DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form'
import { Input } from "@/app/components/ui/input"
import { submitRefundRequest } from "@/lib/actions/discussion-actions/submit-refund-request"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { refunds, user } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Result } from 'antd'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod'
import { useChat } from "../../components/client-chat/provider"

const refundformtype = z.object({
  accountnumber: z.string()
    .min(11, { message: "Please enter a valid number!" })
    .max(11, { message: "Invalid number!" }),
  accountname: z.string().min(3, { message: "Please enter a the account's full name!" })
})

export default function RefundBookingForm({ data, bookingid, close }: {
  data: { id: string, refund: z.infer<typeof refunds>, user: z.infer<typeof user>, status: string },
  bookingid: string,
  close: () => void
}) {

  const { setOpen } = useChat()

  // states
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<string>("")
  const [error, setError] = useState<{ code: number, head: string, message: string }>({ code: 0, head: "", message: "" })

  // values 
  const [validity, setValidity] = useState<boolean>(data.refund.isvalid)

  const form = useForm<z.infer<typeof refundformtype>>({
    resolver: zodResolver(refundformtype),
    defaultValues: {
      accountnumber: "",
      accountname: ""
    }
  })

  useEffect(() => {
    if (new Date(data.refund.refundableuntil).getTime() <= new Date().getTime()) {
      setValidity(false)
    }
  }, [data])

  async function onSubmit(values: z.infer<typeof refundformtype>) {
    setSubmitting(true)
    const response = await submitRefundRequest(data.id, bookingid, values, data.user.id, data.user.firstname + " " + data.user.lastname, data.user.email)
    setSubmitting(false)

    if (response.status == 500) {
      setError({ code: response.status, head: "Internal server error!", message: "An unknown error occured while processing your request, please try again later!" })
      return
    }

    setSuccess(response.data)
  }

  const handleContactSupport = () => {
    setOpen(true)
    close()
  }

  return (
    <>
      {
        error.code > 0 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center text-red-500 text-xl">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {error.head}
              </DialogTitle>
              <DialogDescription>{error.message}</DialogDescription>
            </DialogHeader>
          </>
        ) : success.length > 0 ? (
          <>
            <DialogHeader>
              <DialogTitle>Request a refund</DialogTitle>
              <DialogDescription>Request a refund for this booking.</DialogDescription>
            </DialogHeader>
            <div>
              <Result
                status="success"
                title="Successfully submitted a refund request!"
                subTitle={`Your refund request ID is ${success}. Please wait while we verify your request, you can expect the refund in 3-5 days after approval.`}
              />
            </div>
          </>
        ) : data.refund.refundables == 0 || data.refund.refunded ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center text-red-500 text-xl">
                <ExclamationTriangleIcon className="h-4 w-4" />
                No Refundables
              </DialogTitle>
              <DialogDescription>Sorry, but this booking has no refundable amount or was refunded already. if you have some concern, please don&apos;t hesitate to contact us through our <span className="text-blue-500 cursor-pointer hover:underline">facebook page</span> or <span className="text-blue-500 cursor-pointer hover:underline">AR Assistant.</span></DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="bg-prm" onClick={() => close()}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a refund</DialogTitle>
              <DialogDescription>Request a refund for this booking.</DialogDescription>
            </DialogHeader>
            {
              validity == true ? (
                <div className="">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                      <p className="font-semibold text-green-500">This booking is eligible for a refund.</p>
                      {
                        ['Rejected', 'Cancelled'].some((item) => item == data.status) ? (
                          <p className="">Expected refundable amount of <span className="font-semibold">&#8369; {data.refund.refundables.toLocaleString()}</span> (Initial booking payment)</p>
                        ) : (
                          <p>Expected refundable amount <span className="font-semibold">&#8369; {data.refund.refundables.toLocaleString()}</span></p>
                        )
                      }
                      <FormField
                        control={form.control}
                        name="accountnumber"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel htmlFor="gcash-number">Refund Receiving Number (GCash)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="Enter your GCash receiving number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountname"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel htmlFor="gcash-number">Refund Receiving Account Name (GCash)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter your GCash receiving account name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-sm text-gray-500">
                        Please double-check the details above to ensure they are correct. Incorrect information may lead to transactional issues.
                      </p>
                      <br />
                      <Button className="w-full bg-prm">Send the request</Button>
                      <p className="text-sm text-gray-500">
                        You can expect to receive your refund within 3-5 days after submission.
                      </p>
                    </form>
                  </Form>
                </div>
              ) : (
                <>
                  <p className="font-semibold">We are sorry to say that this booking is not valid to be refunded for the following reasons:</p>
                  <ul className="list-disc text-sm pl-4">
                    <li>The refund request must be made within 7 days after cancellation.</li>
                    <li>The booking was cancelled less than 24 hours before the start date.</li>
                  </ul>
                  <p className="text-justify text-sm">If you have any questions regarding this booking, you <span className="text-blue-500 cursor-pointer underline" onClick={() => handleContactSupport()}>Contact Support</span> or message us through our social media. We are happy to help you.</p>
                </>
              )
            }
          </>
        )
      }
      <FullCoverLoading open={submitting} defaultOpen={false} loadingLabel="Submitting your request, please wait..." />
    </>
  )

}