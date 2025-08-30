'use client'

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function BookingIdInput() {

  const router = useRouter()

  const [bookingid, setBookingid] = useState<string>("")

  const checkBooking = async () => {
    router.push(`/scan/${bookingid}`)
  }

  return (
    <div className="w-full flex">
      <Input
        className="rounded-tr-none rounded-br-none"
        value={bookingid}
        onChange={(e) => setBookingid(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") checkBooking()
        }}
        placeholder="Booking ID..." />
      <Button className="w-max rounded-tl-none rounded-bl-none bg-prm" onClick={() => checkBooking()}>Check</Button>
    </div>
  )
}