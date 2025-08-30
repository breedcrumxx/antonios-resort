'use client'

import { Separator } from "@/app/components/ui/separator"
import { usePackageData } from "@/app/providers/package-data-provider"
import { useCheckout } from "../../provider"

export default function TransactionDetails() {

  const { packagedata } = usePackageData()
  const { calculation, nights, slot, sets, activeCoupons } = useCheckout()

  return (
    <>
      <div className="w-full">
        <div className="w-full flex justify-between">
          {
            slot == "regular" ? (
              <p className="font-semibold">Cottage and swimming</p>
            ) : (
              <p className="font-semibold"><span className="capitalize">{slot}</span> tour:</p>
            )
          }
          <p>&#8369; {(calculation.packageprice).toLocaleString()}</p>
        </div>
        <div className="w-full flex justify-between">
          <p className="font-semibold">Sets</p>
          <p>x {sets}</p>
        </div>
        {
          nights > 1 && (
            <div className="w-full flex justify-between">
              <p className="font-semibold">Nights:</p>
              <p>x {nights}</p>
            </div>
          )
        }
      </div>
      <Separator className="my-2" />
      <div className="w-full">
        {
          (activeCoupons.length > 0 || (packagedata && packagedata.discount > 0)) && (
            <>
              <div className="w-full flex justify-between">
                <p className="font-semibold">Sub-total</p>
                <p className="line-through">&#8369; {(calculation.subtotal).toLocaleString()}</p>
              </div>
              {
                activeCoupons.map((item, i) => (
                  <div className="w-full flex justify-between pl-4 text-sm" key={i}>
                    <p className="font-semibold">Coupon {item.couponcode}</p>
                    <p>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                  </div>
                ))
              }
              {
                packagedata && packagedata.discount > 0 && (
                  <div className="w-full flex justify-between text-xs pl-4">
                    <p className="font-semibold">Applied discount</p>
                    <p>- {packagedata.discount} %</p>
                  </div>
                )
              }
              <Separator className="my-2" />
            </>
          )
        }
        <div className="w-full flex justify-between">
          <p className="font-semibold">Total amount:</p>
          <p>&#8369; {calculation.total.toLocaleString()}</p>
        </div>
      </div>
    </>
  )
}