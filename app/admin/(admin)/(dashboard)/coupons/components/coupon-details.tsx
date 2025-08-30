'use client'

import { Button } from "@/app/components/ui/button"
import { DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { extendedcoupons } from "@/lib/zod/z-schema"
import clsx from "clsx"
import { useState } from "react"
import { z } from "zod"
import BookingsCouponsDetails from "./BookingsCouponDetails"
import UserCouponDetails from "./user-coupons"

export default function CouponDetails({ data }: { data: z.infer<typeof extendedcoupons> }) {

  // states
  const [active, setActive] = useState<"users" | "bookings">("users")

  return (
    <>
      <DialogHeader>
        <DialogTitle>Monitor Coupons</DialogTitle>
        <div>
          <Button variant="ghost" className={clsx("", { "bg-black text-white": active == "users" })} onClick={() => setActive("users")}>Users</Button>
          <Button variant="ghost" className={clsx("", { "bg-black text-white": active == "bookings" })} onClick={() => setActive("bookings")}>Bookings</Button>
        </div>
      </DialogHeader>
      {
        active == "users" ? (
          <UserCouponDetails data={data} />
        ) : active == "bookings" && (
          <BookingsCouponsDetails data={data} />
        )
      }
    </>
  )
}