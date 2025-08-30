'use client'

import { Button } from "@/app/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { getBookingReason } from "@/lib/actions/booking-actions/get-booking-reason"
import { conciseDate } from "@/lib/utils/concise-date"
import { cancellationrejection } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import { useEffect, useState } from "react"
import z from 'zod'

export default function CancellationRejectionReasonPanel({ bookingid, status }: { bookingid: string, status: string }) {

  // states
  const [state, setState] = useState<number>(0)

  // values
  const [reason, setReason] = useState<z.infer<typeof cancellationrejection> | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getBookingReason(bookingid)

      if (response.status == 500) {
        setState(response.status)
        message.error("An error occured, please try again later!")
        return
      } else if (response.status == 404) {
        setState(response.status)
      }

      setReason(response.data as z.infer<typeof cancellationrejection>)
      setState(response.status)
    }

    fetchData()
  }, [])

  return (
    <>
      {
        state == 0 ? (
          <div className="flex items-center justify-center py-10">
            <Spinner label="Loading, please wait..." />
          </div>
        ) : state == 500 ? (
          <>
            <DialogHeader>
              <DialogTitle>Reason for {status == "Cancelled" ? "Cancellation" : "Rejection"}</DialogTitle>
              <DialogDescription className="text-red-500">An error occured, please try again later.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Close</Button>
              <Button>Report</Button>
            </DialogFooter>
          </>
        ) : state == 404 ? (
          <>
            <DialogHeader>
              <DialogTitle>Reason for {status == "Cancelled" ? "Cancellation" : "Rejection"}</DialogTitle>
              <DialogDescription className="text-red-500">Unable to find the data related, please try again later.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Close</Button>
              <Button>Report</Button>
            </DialogFooter>
          </>
        ) : state == 200 && reason && (
          <>
            <DialogHeader>
              <DialogTitle>Reason for {status == "Cancelled" ? "Cancellation" : "Rejection"}</DialogTitle>
              <DialogDescription>The following is the reason for the booking being <span className="text-semibold">{status}.</span></DialogDescription>
            </DialogHeader>
            <div>
              <div>
                <p><span className="font-semibold">Type: </span>{status == "Cancelled" ? "Cancellation" : "Rejection"}</p>
                <p><span className="font-semibold">Reason: </span>{reason.reason}</p>
                <p><span className="font-semibold">Date: </span>{conciseDate(new Date(reason.created_at))}</p>
              </div>
            </div>
          </>
        )
      }
    </>
  )
}