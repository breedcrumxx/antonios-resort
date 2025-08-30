'use client'

import { useEffect, useState } from "react"
import { useCheckout } from "../../provider"

export default function AmountToPay() {

  const { calculation, paymentType } = useCheckout()

  // values
  const [countdown, setCountdown] = useState<number>(900) // value as seconds, = 15 minutes

  useEffect(() => {
    if (countdown <= 0) {
      window.location.reload();
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [countdown])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="w-[400px] mx-auto py-6">
      <div className="w-full flex font-semibold justify-between px-4">
        <h1>Payment type:</h1>
        <p>{paymentType}</p>
      </div>
      <div className="w-full flex font-semibold justify-between px-4">
        <h1>Amount to pay: </h1>
        <p>&#8369; {
          (calculation.total * (calculation.downpaymentpercentage / 100)).toLocaleString()
        }</p>
      </div>
      <div className="mt-4 text-center">
        <p>Please make the payment before the time runs out, we are holding the date for you.</p>
      </div>
      <div className="w-full text-center font-bold px-4">
        <h1>Time remaining</h1>
        <p className="text-red-500">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`} {minutes > 0 ? "minutes" : "seconds"}</p>
      </div>
      <div className="mt-4 text-center">
        <p>Failing to do so will mark the booking as voided, and the browser will reload.</p>
      </div>
    </div>
  )
}