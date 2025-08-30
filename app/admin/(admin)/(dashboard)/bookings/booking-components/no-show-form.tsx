'use client'

import CancelBookingPolicy from "@/app/(home)/profile/components/cancel-booking-policy"
import { Button } from "@/app/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import { bookingdata } from "@/lib/zod/z-schema"
import { sub } from "date-fns"
import { useState } from "react"
import z from 'zod'

export default function NoShowForm({ booking, close }: { booking: z.infer<typeof bookingdata>, close: () => void }) {

  return (
    <div></div>
  )

  // // states
  // const [showCancel, setShowCancel] = useState<boolean>(false)

  // if (booking.units == 1 || booking.continues) {

  //   // check if the booking supposed to start 2 hrs ago
  //   if (new Date(sub(new Date(), { hours: 2 })).getTime() < new Date(booking.startdate).getTime()) {
  //     return (
  //       <>
  //         <DialogHeader>
  //           <DialogTitle>No Show on Booking</DialogTitle>
  //           <DialogDescription>Please give the client a 2 hours margin before marking this booking as <span className="text-red-500 underline">No Show</span>.</DialogDescription>
  //         </DialogHeader>
  //         <DialogFooter>
  //           <Button onClick={() => close()}>Understood</Button>
  //         </DialogFooter>
  //       </>
  //     )
  //   } else {
  //     return (
  //       <>
  //         {
  //           showCancel ? (
  //             <CancelBookingPolicy
  //               data={booking.id}
  //               close={() => close()}
  //               adminRequest
  //             />
  //           ) : (
  //             <CoolDownDialog
  //               open={true}
  //               close={() => close()}
  //               title="No Show on Booking"
  //               description={"Since this booking is for one day only or contiues, marking it as a no-show will result in the booking being automatically cancelled. Please confirm that you want to proceed with canceling this booking."}
  //               accept={() => setShowCancel(true)}
  //               isContent
  //             />
  //           )
  //         }
  //       </>
  //     )
  //   }
  // } else { // booking has no started session yet

  //   return (
  //     <>
  //       {
  //         showCancel ? (
  //           <CancelBookingPolicy
  //             data={booking.id}
  //             close={() => close()}
  //             adminRequest
  //           />
  //         ) : (
  //           <>
  //             <CoolDownDialog
  //               open={true}
  //               close={() => close()}
  //               title={<DialogTitle>No Show on Booking</DialogTitle>}
  //               description={<DialogDescription>The client failed to start any session for this booking, marking it as a no-show will result in the booking being automatically cancelled. Please confirm that you want to proceed with canceling this booking.</DialogDescription>}
  //               accept={() => setShowCancel(true)}
  //               isNode
  //               isContent
  //             />
  //           </>
  //         )
  //       }
  //     </>
  //   )
  // }


}