'use client'

import { Input } from "@/app/components/ui/input"
import { grabThisCouponcode } from "@/lib/actions/coupon-actions/coupon-actions"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import clsx from "clsx"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export default function CouponPageHead() {

  const router = useRouter()
  const pathname = usePathname()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // values
  const [couponid, setCouponid] = useState<string>("")

  const search = async () => {
    setLoading(true)
    const response = await grabThisCouponcode(couponid)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured!")
      return
    } else if (response.status == 404) {
      message.error("Coupon not found!")
      return
    } else if (response.status == 401) {
      router.push("/signin?callbackUrl=/profile/mycoupons")
      return
    }

    setCouponid("")
    message.success("Coupon grabbed!")
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <div className="relative">
        <Input
          value={couponid}
          onChange={(e) => setCouponid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              search()
            }
          }}
          placeholder="coupon code..."
          disabled={loading} />
        {
          loading && (
            <Spinner size="sm" className="absolute top-1/2 right-4 -translate-y-2/4" />
          )
        }
      </div>
      <div className="w-max flex items-center p-[5px] gap-4 bg-white rounded-sm border">
        <Link prefetch={true} href="/profile/mycoupons" className={clsx("px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname == "/profile/mycoupons" }
        )}>My coupons</Link>
        <Link prefetch={true} href="/profile/mycoupons/box" className={clsx("px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname == "/profile/mycoupons/box" }
        )}>Coupon box</Link>
      </div>
    </div>
  )

}