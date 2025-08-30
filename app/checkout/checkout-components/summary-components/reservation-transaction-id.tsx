'use client'

import { useEffect } from "react"
import { useCheckout } from "../../provider"

export default function ReservationAndTransactionIds() {

  const { bookingid, transactionid } = useCheckout()

  useEffect(() => {
    sessionStorage.removeItem("package")
  }, [])

  return (
    <>
      <span className="gap-4">Booking #: {bookingid}</span>
      <br />
      <span className="gap-4">Transaction #: {transactionid}</span>
    </>
  )

}