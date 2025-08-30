'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/app/components/ui/select"
import { Skeleton } from "@/app/components/ui/skeleton"
import { extendedcoupons } from "@/lib/zod/z-schema"
import { Empty, message } from "antd"
import axios, { CanceledError } from "axios"
import { useEffect, useState } from "react"
import { z } from "zod"
import Coupon from "./coupon"

export default function CouponFetcher({ userid }: { userid: string }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<string>("all")

  // values
  const [data, setData] = useState<z.infer<typeof extendedcoupons>[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/coupons/mycoupons/${userid}?filter=${filter}`, { signal })

        setData(response.data.mycoupons)
      } catch (error) {
        if (!(error instanceof CanceledError)) {
          message.error("Unable to get the coupons, please try again later!")
        }
      }

      setLoading(false)
    }

    setLoading(true)
    fetchData()

    return () => {
      controller.abort()
    }
  }, [filter])

  return (
    <>
      <div className="w-full flex justify-end px-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filters</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cottage">Cottage</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="event">Event center</SelectItem>
              <SelectItem value="reschedule">Reschedule</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full my-2 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:grid-rows-auto sm:gap-4 px-4">
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
          ) : (
            <>
              {
                data.filter((item) => !item.bookings.length).map((item, i) => (
                  <Coupon
                    variant="default"
                    item={item as z.infer<typeof extendedcoupons>}
                    key={i}
                    isGrabbed />
                ))
              }
            </>
          )
        }
      </div>
      <br />
      {
        data.filter((item) => item.bookings.length).length > 0 && !loading && (
          <>
            <h1 className="font-semibold">Used coupons</h1>
            <div className="w-full my-2 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:grid-rows-auto sm:gap-4">
              {
                data.filter((item) => item.bookings.length).map((item, i) => (
                  <Coupon
                    variant="disabled"
                    item={item as z.infer<typeof extendedcoupons>}
                    key={i}
                    isGrabbed />
                ))
              }
            </div>
          </>
        )
      }
      {
        !loading && data.length == 0 && (
          <div className="w-full flex items-center justify-center">
            <Empty
              description="No coupons..."
            />
          </div>
        )
      }
    </>
  )
}