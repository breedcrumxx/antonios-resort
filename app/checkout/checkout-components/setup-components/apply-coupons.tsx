'use client'

import Coupon from "@/app/(home)/profile/mycoupons/components/coupon"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"
import { getMyCoupons, grabThisCoupon } from "@/lib/actions/coupon-actions/coupon-actions"
import { useDebounce } from "@/lib/utils/debounce"
import { coupons, extendedcoupons } from "@/lib/zod/z-schema"
import { Badge, Empty, message } from "antd"
import clsx from "clsx"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function ApplyCoupons({
  activeCoupons,
  setActiveCoupons,
  subtotal,
  type,
  className,
}: {
  activeCoupons: z.infer<typeof coupons>[],
  setActiveCoupons: React.Dispatch<React.SetStateAction<z.infer<typeof coupons>[]>>
  subtotal: number,
  type: string
  className?: string,
}) {

  const { data: session } = useSession()

  // states
  const [openCouponPanel, setOpenCouponPanel] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>("")

  //values
  const [onClaim, setOnClaim] = useState<{ id: string, isLoading: boolean, claimed: boolean }[]>([])
  const [data, setData] = useState<z.infer<typeof extendedcoupons>[]>([])

  const searchBounce = useDebounce(searchValue, 300)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await getMyCoupons(type, searchBounce.length > 0 ? searchBounce : undefined)
      setLoading(false)

      if (response.status == 500 || response.status == 401 || response.status == 404) {
        message.error("Unable to get your coupons!")
        return
      }

      setData(response.data)
    }

    setLoading(true)
    fetchData()
  }, [searchBounce, openCouponPanel])

  const setCoupons = async (item: z.infer<typeof extendedcoupons>) => {
    // check for operation
    const exist = activeCoupons.find((x) => x.id == item.id)
    if (exist) {
      // remove the item
      setActiveCoupons((prev) => prev.filter((x) => x.id != item.id))
    } else {
      // check if there's same type of coupon already activated
      const exist = activeCoupons.find((x) => x.percent == item.percent)
      if (exist) {
        // remove the same type coupon, then
        setActiveCoupons((prev) => [...prev.filter((x) => exist.id != x.id), item])
      } else { // use the coupon

        const userid = (session?.user as UserSession).id

        if (!item.userids.some((x) => x == userid)) { // if the coupon hasnt been claimed

          // if the coupons hasnt been claimed by the user
          setOnClaim((prev) => [...prev, { id: item.id, claimed: false, isLoading: true }])
          const response = await grabThisCoupon(item.id, userid)
          if (response.status === 404) message.error("Coupon info went missing, please try again later!")
          if (response.status === 500) message.error("Internal server error, please try again later!")
          if (response.status == 200) {
            message.success("Coupon claimed, use it now!")
            // update the coupon collection with this users id
            setData((prev) => prev.map((x) => {
              if (x.id == item.id) {
                return { ...item, userids: [...item.userids, userid] }
              }
              return item
            }))
            setOnClaim((prev) => prev.map((x) => x.id === item.id ? ({ ...x, claimed: true, isLoading: false }) : x))
          } else {
            setOnClaim((prev) => prev.filter((x) => x.id != item.id))
            return
          }

          // rerun the checking of same type existence
          const exist = activeCoupons.find((x) => x.percent == item.percent)

          if (exist) {
            // remove the same type coupon, then insert the new selected coupon
            setActiveCoupons((prev) => [...prev.filter((x) => exist.id != x.id), { ...item, userids: [...item.userids, userid] }])
            return
          }
        }

        setActiveCoupons((prev) => [...prev, item])
      }
    }
  }

  return (
    <div>
      <Input className={className} placeholder="apply coupons..." onClick={() => setOpenCouponPanel(true)} />
      <Dialog open={openCouponPanel} onOpenChange={(e) => setOpenCouponPanel(e)}>
        <DialogContent className="max-w-screen sm:max-w-[350px] min-h-[60vh] max-h-[60vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Apply coupons</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="relative">
            <X className={searchValue.length > 0 ? "absolute right-4 top-1/2 -translate-y-2/4 h-4 w-4" : "hidden"} onClick={() => setSearchValue("")} />
            <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Enter coupon code..." />
          </div>
          <div className="flex-grow space-y-2 px-2 overflow-y-auto scroll">
            {
              loading ? (
                <>
                  <Skeleton className='w-full h-[100px]' />
                  <Skeleton className='w-full h-[100px]' />
                  <Skeleton className='w-full h-[100px]' />
                </>
              ) : (
                <div className="space-y-2">
                  {
                    data.length == 0 && (
                      <div className="flex justify-center py-10 items-center">
                        <Empty description="No coupons applicable..." />
                      </div>
                    )
                  }
                  {
                    data.map((item, i) => (
                      <Badge.Ribbon
                        className={clsx("text-md w-full", { "hidden": !activeCoupons.some((x) => x.id == item.id) })}
                        color="green"
                        text="Applied!"
                        key={`badge-${i}`}>
                        <Coupon
                          variant={item.minamount > subtotal ? "disabled" : item.bookings.length > 0 ? "used" : item.userids.length > item.max ? "maxed" : onClaim.some((x) => x.id === item.id && x.isLoading) ? 'loading' : onClaim.some((x) => x.id === item.id && x.claimed) ? 'claimed' : "default"}
                          item={item as z.infer<typeof extendedcoupons>}
                          onClick={() => setCoupons(item)}
                          key={i}
                        />
                      </Badge.Ribbon>
                    ))
                  }
                </div>
              )
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}