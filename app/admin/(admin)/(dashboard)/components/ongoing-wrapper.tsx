'use client'

import FullBookingDetails from "@/app/admin/components/bookings-feature/full-booking-details"
import { Dialog, DialogContent } from "@/app/components/ui/dialog"
import React, { useState } from "react"

export default function OngoingWrapper({ children, bookingid }: { children: React.ReactNode, bookingid: string }) {

  // states
  const [openViewDetails, setOpenViewDetails] = useState<boolean>(false)

  return (
    <>
      <div className="w-full flex-grow py-2 hover:bg-muted/30 cursor-pointer" onClick={() => setOpenViewDetails(true)}>
        {children}
      </div>
      <Dialog open={openViewDetails} onOpenChange={(e) => setOpenViewDetails(e)}>
        <DialogContent className="min-w-[80vw] min-h-[80vh] max-w-[80vw] max-h-[80vh] flex flex-col overflow-hidden">
          <FullBookingDetails data={{ id: bookingid } as BookingDataTable} />
        </DialogContent>
      </Dialog>
    </>
  )
}