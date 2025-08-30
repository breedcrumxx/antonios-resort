'use client'

import FullBookingDetails from "@/app/admin/components/bookings-feature/full-booking-details"
import { bookingrecord } from "@/lib/zod/z-schema"
import { CornerUpLeft } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

export default function ScanContent({ data }: { data: z.infer<typeof bookingrecord> }) {


  const [close, setClose] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<string>("")

  return (
    <>
      {
        activeView != "default" && (
          <p className="cursor-pointer flex items-center gap-2" onClick={() => setClose(true)}> <CornerUpLeft className="w-4 h-4" /> back</p>
        )
      }
      <FullBookingDetails
        data={data}
        currentActiveView={(value: string) => setActiveView(value)}
        setClose={() => setClose(false)}
        close={close}
        isContent
        isOnScan
      />
    </>
  )
}