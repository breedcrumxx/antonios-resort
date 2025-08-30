'use client'

import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Skeleton } from "@/app/components/ui/skeleton"
import { grabThisCoupon } from "@/lib/actions/coupon-actions/coupon-actions"
import { useDebounce } from "@/lib/utils/debounce"
import { extendedcoupons } from "@/lib/zod/z-schema"
import { Empty, message } from "antd"
import axios, { AxiosError } from "axios"
import clsx from "clsx"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import Coupon from "../../profile/mycoupons/components/coupon"

export default function CouponRenderer({ userid }: { userid?: string }) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  // values
  const [availableCoupons, setAvailableCoupons] = useState<z.infer<typeof extendedcoupons>[]>([])
  const [onClaim, setOnClaim] = useState<{ id: string, isLoading: boolean, claimed: boolean }[]>([])

  const couponcode: string = useDebounce(search, 300)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/coupons/onwebsite?${userid ? `userid=${userid}` : ""}&filter=${filter}${couponcode.length > 0 ? `&search=${couponcode}` : ''}`, { signal })
        setAvailableCoupons(response.data)
      } catch (error) {
        if (error instanceof AxiosError && error.code == "ERR_CANCELED") return
        console.error(error)
        message.error("Unable to get coupons, please try again later!")
      }
      setLoading(false)
    }

    setLoading(true)
    fetchData()

    return () => {
      controller.abort()
    }
  }, [filter, couponcode, userid])

  const claimCoupon = async (item: z.infer<typeof extendedcoupons>) => {
    if (!userid) {
      router.push("/signin")
      return
    }

    setOnClaim((prev) => ([...prev, { id: item.id, claimed: false, isLoading: true }]))

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const response = await grabThisCoupon(item.id, userid)
    if (response.status === 403) {
      message.error("Unauthenticated, please login first!")
      router.push("/signin")
      return
    }
    if (response.status === 404) message.error("Coupon info went missing, please try again later!")
    if (response.status === 500) message.error("Internal server error, please try again later!")
    if (response.status == 200) {
      message.success("Claimed, place a booking now!")
      setOnClaim((prev) => prev.map((x) => x.id === item.id ? ({ ...x, claimed: true, isLoading: false }) : x))
    } else {
      setOnClaim((prev) => prev.filter((x) => x.id != item.id))
    }
  }

  return (
    <div className="w-full min-h-screen block space-y-2 px-4 sm:px-0 sm:space-y-0 sm:flex gap-4">
      <div className="hidden sm:block w-1/4 h-max p-4 space-y-2 border">
        <div className="relative group">
          <Input placeholder="coupon code..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <X className="absolute w-4 h-4 right-4 top-1/2 -translate-y-2/4 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => setSearch("")} />
        </div>
        <div>
          <Label>Filters</Label>
          <RadioGroup className="px-4" value={filter} onValueChange={setFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="r0" />
              <Label htmlFor="r0">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cottage" id="r1" />
              <Label htmlFor="r1">For cottage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="villa" id="r2" />
              <Label htmlFor="r2">For villa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="event" id="r3" />
              <Label htmlFor="r3">For event center</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reschedule" id="r4" />
              <Label htmlFor="r4">For rescheduling</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <h1 className="block sm:hidden">Search coupon</h1>
      <div className="relative group block sm:hidden">
        <Input placeholder="coupon code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <X className="absolute w-4 h-4 right-4 top-1/2 -translate-y-2/4 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => setSearch("")} />
      </div>

      <div className={clsx("w-full sm:w-3/4 h-max", {
        "flex justify-center": availableCoupons.length == 0,
        "flex flex-col sm:grid sm:grid-cols-3 gap-4": availableCoupons.length > 0 || loading,
      })}>
        {
          loading ? (
            <>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
              <div className="w-full bg-white h-max p-2 rounded-tl-md rounded-bl-md shadow">
                <div className="p-2 border rounded-sm flex flex-col items-center space-y-2">
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[70%] h-6 bg-gray-500" />
                  <Skeleton className="w-[60%] h-2" />
                  <Skeleton className="w-[50%] h-2" />
                  <Skeleton className="w-[80%] h-2 bg-gray-500" />
                </div>
              </div>
            </>
          ) : availableCoupons.length == 0 ? (
            <Empty
              description="No available coupons to grab..."
            />
          ) : (
            <>
              {
                availableCoupons.map((item, i) => (
                  <Coupon
                    variant={item.userids.length >= item.max ? "maxed" : onClaim.some((x) => x.id === item.id && x.isLoading) ? 'loading' : onClaim.some((x) => x.id === item.id && x.claimed) ? 'claimed' : 'default'}
                    item={item as z.infer<typeof extendedcoupons>}
                    onClick={() => claimCoupon(item)}
                    key={i}
                  />
                ))
              }
            </>
          )
        }
      </div>
    </div>
  )
}