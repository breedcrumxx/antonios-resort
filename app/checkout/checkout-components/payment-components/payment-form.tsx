'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { finalizeBooking } from "@/lib/actions/booking-actions/process-booking"
import { useEdgeStore } from "@/lib/edgestore"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { transactiondata } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from 'antd'
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod'
import { useCheckout } from "../../provider"
import PaymentImagePicker from "./payment-image-picker"

const isImage = (file: File) => {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
};

const paymentSchema = z.object({
  referencenum: z.string().min(1, "Please enter the payment reference number!")
    .min(10, { message: "Reference number typically consist of 10 or more number!" }), // Name should be a non-empty string
  referenceimage: z.instanceof(File).refine(isImage, {
    message: "The file must be an image (jpeg, png, gif, or webp)",
  })
});

export default function PaymentForm({ user }: { user: UserSession }) {


  // context
  const { edgestore } = useEdgeStore()
  const {
    setTab,
    paymentType,
    calculation,
    reservationConfig,
    transactionid,
    id,
  } = useCheckout()

  // states
  const [loading, setLoading] = useState<string>("")
  const [errorMode, setErrorMode] = useState<errorModeType>(null)

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      referencenum: "",
      referenceimage: undefined,
    }
  })

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setLoading("Processing, please wait...")

    // check for packagedata 
    if (!calculation) {
      message.error(`Failed to place a booking, please try again later.`)
      setLoading("")
      return
    }

    // upload the image
    let uploadLink: {
      url: string;
      thumbnailUrl: string | null;
      size: number;
      uploadedAt: Date;
      metadata: Record<string, never>;
      path: Record<string, never>;
      pathOrder: string[];
    } | null = null

    try {
      const res = await edgestore.publicImages.upload({
        file: values.referenceimage as File,
        options: {
          temporary: true,
        }
      });
      // get the url link
      uploadLink = res
    } catch (err) {
      message.error(`Failed to upload reference image, please try again later.`)
      setLoading("")
      return
    }

    let balance = 0

    if (paymentType == "Down payment") {
      const downpayment = calculation.total * (reservationConfig.downpayment / 100)
      balance = calculation.total - downpayment
    }

    let balances = (balance > 0 ? [{
      id: "",
      bookingid: "",
      type: "Payment balance",
      record: `Balance of ₱ ${balance.toLocaleString()} for this booking.`,
      total: balance,
    }] : [])

    // create a transaction
    const transaction = {
      reference: values.referencenum,
      referenceimage: uploadLink.url,
      payment_type: paymentType,
      expectedpayment: (calculation.total * (calculation.downpaymentpercentage / 100)),
      type: "Booking",
      date: new Date(),
    }

    // finalize the booking and create the record
    const response = await finalizeBooking(transaction as z.infer<typeof transactiondata>, transactionid, id, balances)
    setLoading("")

    if (response.status == 500) {
      setErrorMode({
        title: "An Error Occured!",
        description: "We encountered an error while processing your payment, please try again. If the issue persist, please contact Customer support",
        showHome: true,
        showClose: false,
        closable: true,
      })
      return
    } else if (response.status == 409) {
      setErrorMode({
        title: "Invalid Reference Number!",
        description: response.data as string,
        showHome: false,
        showClose: true,
        closable: true,
      })
      return
    }

    // move to summary tab
    setTab("summary")
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 sm:px-0">
          <FormField
            control={form.control}
            name="referencenum"
            render={({ field }: any) => (
              <FormItem>
                <div className="w-full sm:w-[400px] mx-auto">
                  <FormLabel>Payment reference number</FormLabel>
                  <FormControl>
                    <Input minLength={10} {...field} placeholder="Payment reference number" />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceimage"
            render={({ field }: any) => (
              <FormItem>
                <div className="w-full sm:w-[400px] mx-auto">
                  <FormLabel>Payment reference image</FormLabel>
                  <FormControl>
                    <PaymentImagePicker value={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-red-500 text-xs">Please DO NOT CROP OR EDIT THE IMAGE REFERENCE YOU ARE ABOUT TO UPLOAD!</p>
                </div>
              </FormItem>
            )}
          />
          <br />
          <br />
          <div className="w-full flex justify-center">
            <Button className="w-full sm:w-[400px] bg-prm">Pay</Button>
          </div>
        </form>
      </Form >
      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
      <Dialog open={errorMode != null} onOpenChange={(e) => setErrorMode(null)}>
        <DialogContent className="" disableclose={!errorMode?.closable}>
          <DialogHeader>
            <DialogTitle className="text-red-500">{errorMode?.title}</DialogTitle>
            <DialogDescription>{errorMode?.description}</DialogDescription>
            {
              errorMode?.showClose && (
                <Button onClick={() => setErrorMode(null)} className="flex justify-center w-full py-2 bg-prm text-white rounded-sm">Close</Button>
              )
            }
            {
              errorMode?.showHome && (
                <Link href="/" className="flex justify-center w-full py-2 bg-prm text-white rounded-sm">Return to home page</Link>
              )
            }
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}