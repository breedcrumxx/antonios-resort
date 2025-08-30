'use client'

import { Button } from "@/app/components/ui/button"
import { useCheckout } from "../../provider"

export default function SummaryTail() {

  const {
    calculation,
    paymentType,
    setTab,
  } = useCheckout()

  return (
    <>
      {
        paymentType == "Down payment" ? (
          <>
            <div className="w-full flex justify-between">
              <p className="font-semibold">Amount paid:</p>
              <p className="">&#8369; {(calculation.total * (calculation.downpaymentpercentage / 100)).toLocaleString()}</p>
            </div>

            <div className="w-full flex justify-between text-xl font-semibold">
              <p>To pay on-site:</p>
              <p className="">&#8369; {
                (
                  calculation.total -
                  (calculation.total * (calculation.downpaymentpercentage / 100))
                ).toLocaleString()
              }</p>
            </div>
            <div className="w-full flex justify-between text-xs">
              <p className="font-semibold">VAT Tax (already included):</p>
              <p>&#8369; {(calculation.vat).toLocaleString()}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex justify-between text-xl font-semibold">
              <p className="font-semibold">Amount paid:</p>
              <div>
                <p className="">&#8369; {
                  (calculation.total).toLocaleString()
                }</p>
              </div>
            </div>
            <div className="w-full flex justify-between text-xs">
              <p className="font-semibold">VAT Tax (already included):</p>
              <p>&#8369; {(calculation.vat).toLocaleString()}</p>
            </div>
          </>
        )
      }
      {/* <Button className="w-full bg-prm" onClick={() => setTab("setup")}>Return to checkout</Button> */}
    </>
  )
}