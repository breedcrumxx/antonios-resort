'use client'

import { usePackageData } from "@/app/providers/package-data-provider"
import { useCheckout } from "../../provider"
import { format } from "date-fns"

export default function BookingDetails({ user }: { user: UserSession }) {

  const { packagedata } = usePackageData()
  const {
    dateStart,
    dateEnd,
    paymentType,
    paymentOption
  } = useCheckout()

  return (
    <>
      {
        packagedata && (
          <>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Guest name:</p>
              <p>{user.name}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Package:</p>
              <p>{packagedata.packagename}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Book at:</p>
              <p>{format(new Date(), "MM/dd/yy HH:mm")}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Check-in:</p>
              <p>{format(dateStart as Date, "MM/dd/yy HH:mm")}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Check-out:</p>
              <p>{format(new Date((dateEnd ? dateEnd : new Date())), "MM/dd/yy HH:mm")}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Payment option:</p>
              <p>{paymentOption}</p>
            </div>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Payment type:</p>
              <p>{paymentType}</p>
            </div>
          </>
        )
      }
    </>
  )
}