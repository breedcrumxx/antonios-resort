'use client'

import { usePackageData } from "@/app/providers/package-data-provider"
import BookingSummaryEmail from "@/lib/email-templates/summary-email"
import { conciseDate } from "@/lib/utils/concise-date"
import { bookingdata, extendedpackageoffer } from "@/lib/zod/z-schema"
import { render } from "@react-email/render"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useCheckout } from "../provider"
import dynamic from "next/dynamic"
const DownloadReceipt = dynamic(() => import('./summary-components/download-receipt'), { ssr: false })

export default function ReceiptDebugger({ user }: { user: UserSession }) {

  const { packagedata } = usePackageData()
  const {
    paymentType,
    dateStart,
    dateEnd,
    calculation,
    nights,
    slot,
    paymentOption,
    reservationConfig,
    guestCount,
    sets,
    activeCoupons,
  } = useCheckout()

  const [content, setContent] = useState<string>("")


  useEffect(() => {
    let balance = 0

    if (paymentType == "Down payment") {
      const downpayment = calculation.total * (reservationConfig.downpayment / 100)
      balance = calculation.total - downpayment
    }

    const placebooking = bookingdata.omit({
      id: true,
      bookingid: true,
      refundid: true,
      refund: true,
      transacid: true,
      transaction: true,
      client: true,
      appliedcoupons: true,
      bookinglog: true,
    })

    let balances = (balance > 0 ? [{
      id: "",
      bookingid: "",
      type: "Payment balance",
      record: `Balance of ₱ ${balance.toLocaleString()} for this booking.`,
      total: balance,
    }] : [])

    // prepare all the data that needs to create a prebooking
    const booking: z.infer<typeof placebooking> = {
      book_at: new Date(),
      checkin: dateStart as Date,
      checkout: dateEnd as Date,
      slot: (packagedata as z.infer<typeof extendedpackageoffer>).type == "cottage" ? "regular" : slot,
      days: nights,
      packageid: (packagedata as z.infer<typeof extendedpackageoffer>).id,
      packagedata: JSON.stringify(packagedata),
      quantity: sets,
      legal: null,

      adults: guestCount.adults,
      seniorpwds: guestCount.seniorpwds,
      teenkids: guestCount.teenkids,
      celebrant: guestCount.celebrants,

      total: calculation.total,
      // totaldiscount: calculation.discount,
      downpaymentasofnow: reservationConfig.downpayment,
      status: "Pending",

      balance: balances,
      clientid: user.id,

      couponids: activeCoupons.map((item) => item.id),

      lastacceptedprivacy: new Date(),
      lastacceptedagreement: new Date(),
      lastacceptedtermscondition: new Date(),
    };

    // create a transaction
    const transaction = {
      payment_type: paymentType,
      expectedpayment: (calculation.total * (calculation.downpaymentpercentage / 100)),
    }

    // prepare the data needed to send an email
    // pass the data to the sender

    const emaildata = {
      name: user.name,
      packagename: (packagedata ? packagedata.packagename : ""),
      book_at: conciseDate(booking.book_at),
      check_in: conciseDate(dateStart),
      check_out: conciseDate(dateEnd),
      paymentOption: paymentOption,
      paymenttype: paymentType,
      calculation: calculation,
      slot: slot,
      sets: sets,
      days: nights,
      bookingid: "AR-B-3748957345",
      transactionid: "AR-T-3748957345",
      amountpaid: transaction.expectedpayment,
      activeCoupons: activeCoupons,
      applieddiscount: packagedata ? packagedata.discount : 0
    }

    const emailHTML = render(<BookingSummaryEmail {...emaildata} />)
    setContent(emailHTML)
  }, [])

  return (
    <>
      <div className="min-h-screen" dangerouslySetInnerHTML={{ __html: content }}>
      </div>
      <DownloadReceipt />
    </>
  )
}