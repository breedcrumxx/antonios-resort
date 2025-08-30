'use client'

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { extendBooking } from "@/lib/actions/booking-actions/extend-booking"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { getOccupiedDates } from "@/lib/utils/get-occupied-dates"
import { coupons, extendedcoupons, extendedpackageoffer } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { message, Result } from "antd"
import { add, eachDayOfInterval } from "date-fns"
import moment from "moment"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Matcher } from "react-day-picker"
import { z } from "zod"

export default function ExtendFormContent({
  bookingid,
  sets,
  checkin,
  days,
  prevtotal,
  bookingpackage,
  appliedcoupons,
  close,
}: {
  bookingid: string,
  sets: number,
  checkin: Date,
  days: number,
  prevtotal: number,
  bookingpackage: z.infer<typeof extendedpackageoffer>,
  appliedcoupons: z.infer<typeof coupons>[]
  close: () => void
}) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [processing, setProcessing] = useState<boolean>(false)
  const [status, setStatus] = useState<"default" | "success">("default")

  // values
  const [lockDates, setLockDates] = useState<Date[]>([])
  const [additionalNights, setAdditionalNights] = useState<number>(0)
  const [currentAdditionalPrice, setCurrentAdditionalPrice] = useState<number>(0)
  const [finalCharges, setFinalCharges] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {

      const response = await getOccupiedDates(bookingpackage.id)
      setLoading(false)

      if (response.status == 200) {
        // for each date that exist in bookings, I need to count the bookings of that date
        const dates = response.data?.filter((item) => item.id != bookingid)
          .map((item) => {
            const collection: Date[] = []
            for (let i = 0; i < item.quantity; i++) {
              collection.push(...eachDayOfInterval({ start: item.checkin, end: item.checkout }))
            }
            return collection
          })
          .flat() as Date[]

        setLockDates(dates)
        return
      }
      message.error("Unknown error occured!")
      // setErrorReport("Unable to get the dates!")
      // setError(true)
    }

    fetchData()
  }, [])

  const getSelected = () => {

    let tempDateout = new Date()

    const timeinHours = parseInt(bookingpackage.night_tour.timein.split(":")[0])
    const timeinMinutes = parseInt(bookingpackage.night_tour.timein.split(":")[1])
    const duration = bookingpackage.night_tour.duration
    // then calculate the timein and timeout for each day looping, to get the ending date of the reservation
    for (let i = 0; i < (days + additionalNights); i++) {
      // add the hours and minutes of the timein
      // then add the duration of the package
      tempDateout = moment(add(new Date(new Date(checkin).setHours(timeinHours, timeinMinutes, 0, 0)), { days: i, hours: duration })).toDate()
    }
    return { from: checkin, to: tempDateout }
  }

  const addDays = (addDays: number) => {

    let tempDateout = new Date()

    const timeinHours = parseInt(bookingpackage.night_tour.timein.split(":")[0])
    const timeinMinutes = parseInt(bookingpackage.night_tour.timein.split(":")[1])
    const duration = bookingpackage.night_tour.duration
    // then calculate the timein and timeout for each day looping, to get the ending date of the reservation
    for (let i = 0; i < (days + addDays); i++) {
      // add the hours and minutes of the timein
      // then add the duration of the package
      tempDateout = moment(add(new Date(new Date(checkin).setHours(timeinHours, timeinMinutes, 0, 0)), { days: i, hours: duration })).toDate()
    }

    // check for dates first
    const userdaterange = eachDayOfInterval({ start: checkin, end: tempDateout })
    const isValidSelection = !userdaterange.some(date => lockDates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length >= bookingpackage.quantity);

    if (!isValidSelection) {
      message.error("Booking will overlap, please adjust your date!")
      return
    }

    setAdditionalNights(addDays)

    const subtotal = (bookingpackage.night_tour.price * addDays) * sets
    const percentagecoupons = appliedcoupons
      .filter((item) => item.type == "villa" && item.percent)
      .reduce((a, b) => a + b.amount, 0) + bookingpackage.discount
    const absolutecoupons = appliedcoupons
      .filter((item) => item.type == "villa" && !item.percent)
      .reduce((a, b) => a + b.amount, 0)

    const absolutededucted = subtotal - absolutecoupons
    const total = absolutededucted - (absolutededucted * (percentagecoupons / 100))

    setCurrentAdditionalPrice(subtotal)
    setFinalCharges(total)
  }

  const lockIn = async () => {

    let tempDateout = new Date()

    const timeinHours = parseInt(bookingpackage.night_tour.timein.split(":")[0])
    const timeinMinutes = parseInt(bookingpackage.night_tour.timein.split(":")[1])
    const duration = bookingpackage.night_tour.duration
    // then calculate the timein and timeout for each day looping, to get the ending date of the reservation
    for (let i = 0; i < (days + additionalNights); i++) {
      // add the hours and minutes of the timein
      // then add the duration of the package
      tempDateout = moment(add(new Date(new Date(checkin).setHours(timeinHours, timeinMinutes, 0, 0)), { days: i, hours: duration })).toDate()
    }

    const userdaterange = eachDayOfInterval({ start: checkin, end: tempDateout })
    const isValidSelection = !userdaterange.some(date => lockDates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length >= bookingpackage.quantity);

    if (!isValidSelection) {
      message.error("Booking will overlap, please adjust your date!")
      return
    }

    setProcessing(true)
    const response = await extendBooking(bookingid, prevtotal, finalCharges, days, additionalNights, tempDateout)
    setProcessing(false)

    if (response.status == 500) {
      message.error("An error occured, please try again later!")
      return
    }

    setStatus("success")
    router.refresh()

  }

  return (
    <div className="w-auto flex gap-4">
      {
        status == "default" ? (
          <>
            {
              loading ? (
                <div className="w-full flex justify-center py-10">
                  <Spinner label="Loading, please wait..." />
                </div>
              ) : (
                <>
                  <div className="w-[300px]">
                    <Calendar
                      mode="single"
                      selected={checkin}
                      // onSelect={handleSetDate}

                      modifiers={{
                        partial: (date) => {
                          const count = lockDates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count < bookingpackage.quantity
                        },
                        full: (date) => {
                          const count = lockDates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count >= bookingpackage.quantity
                        },
                        selected: getSelected() as Matcher
                      }}

                      modifiersClassNames={{
                        partial: "text-orange-500 bg-orange-300/20",
                        full: "text-red-500 bg-red-300/20 opacity-70 pointer-events-none",
                        selected: "bg-prm text-white",
                      }}

                      // footer={customFooter}

                      //check if the client package will fit in this date
                      // disabled={(date) => {
                      //   if (dev.DEBUG && dev.checkout.freedate) {
                      //     return false
                      //   }

                      //   // disable all past date
                      //   if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
                      //     return true
                      //   }

                      //   return false
                      // }}

                      initialFocus
                    />
                    <div>
                      <Label>Extend your stay for how many nights?</Label>
                      <Input className="w-inherit" type="number" min={1} value={additionalNights} onChange={(e) => addDays(parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="w-[300px] p-4 space-y-2 border">
                    <h1 className="font-semibold">Additional charges</h1>
                    <Separator />
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Night tour price</p>
                      <p className="text-sm">&#8369; {currentAdditionalPrice.toLocaleString()}</p>
                    </div>
                    {
                      (appliedcoupons.length > 0 || bookingpackage.discount > 0) && currentAdditionalPrice > 0 && (
                        <>
                          <Separator />
                          <div className="w-full flex justify-between text-sm">
                            <p className="font-semibold">Sub-total</p>
                            <p className="text-sm line-through">&#8369; {currentAdditionalPrice.toLocaleString()}</p>
                          </div>
                          {
                            appliedcoupons.filter((item) => item.type == "villa").map((item, i) => (
                              <div className="w-full flex justify-between text-xs pl-4" key={i}>
                                <p className="font-semibold">Coupon {item.couponcode}</p>
                                <p>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                              </div>
                            ))
                          }
                          {
                            bookingpackage.discount > 0 && (
                              <div className="w-full flex justify-between text-xs pl-4">
                                <p className="font-semibold">Applied discount</p>
                                <p>- {bookingpackage.discount} %</p>
                              </div>
                            )
                          }
                        </>
                      )
                    }
                    <Separator />
                    <div className="w-full flex justify-between text-md">
                      <p className="font-semibold">Total charges</p>
                      <p className="text-sm">&#8369; {finalCharges.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-blue-500">This will be added to the booking total. Please ask the client for the additional payment before proceeding to lock-in, thank you.</p>
                    <Button className="w-full bg-prm" onClick={() => lockIn()}
                      disabled={additionalNights == 0}>Lock-in</Button>
                    <Button className="w-full" variant={"outline"} onClick={() => close()}>Cancel</Button>
                  </div>
                </>
              )
            }
          </>
        ) : (
          <>
            <Result
              status="success"
              title="Successfully extended the booking!"
              subTitle={`Successfully extended the booking, the booking is now updated, please reload the page, thank you.`}
              extra={
                <Button className="bg-prm" onClick={() => window.location.reload()}>Reload page</Button>
              }
            />
          </>
        )
      }

      <FullCoverLoading open={processing} defaultOpen={false} loadingLabel="Processing, please wait..." />
    </div>
  )
}