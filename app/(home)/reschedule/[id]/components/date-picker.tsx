'use client'

import ApplyCoupons from '@/app/checkout/checkout-components/setup-components/apply-coupons'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Calendar } from "@/app/components/ui/calendar"
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from "@/app/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Separator } from '@/app/components/ui/separator'
import { Skeleton } from '@/app/components/ui/skeleton'
import { useDevs } from '@/app/providers/dev-configuration-provider'
import { rescheduleBooking } from '@/lib/actions/booking-actions/reschedule-booking'
import { ReservationConfigType } from '@/lib/configs/config-file'
import { FormError } from '@/lib/ui/form-banners'
import { cn } from '@/lib/utils/cn'
import { reschedulingReasons } from '@/lib/utils/configurable-data'
import { StaleReport } from '@/lib/utils/error-report-modal'
import FullCoverLoading from '@/lib/utils/full-cover-loading'
import { getOccupiedDates } from '@/lib/utils/get-occupied-dates'
import { bookingrecord, coupons } from '@/lib/zod/z-schema'
import { CalendarIcon } from "@radix-ui/react-icons"
import { message } from 'antd'
import { add, areIntervalsOverlapping, differenceInDays, eachDayOfInterval, format } from 'date-fns'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Matcher } from 'react-day-picker'
import z from 'zod'

export default function DatePicker({
  booking,
  reservationConfig,
  quantity,
  isAdmin,
}: {
  booking: z.infer<typeof bookingrecord>,
  reservationConfig: ReservationConfigType,
  quantity: number,
  isAdmin?: boolean,
}) {

  const { dev } = useDevs()
  const router = useRouter()

  // states
  const [fetching, setFetching] = useState<boolean>(true)
  const [loading, setLoading] = useState<string>("")
  const [dateError, setDateError] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [errorReport, setErrorReport] = useState<string>("")
  const [openReportModal, setOpenReportModal] = useState<boolean>(false)

  // values
  const [newCheckin, setNewCheckin] = useState<Date>()
  const [newCheckout, setNewCheckout] = useState<Date>()
  const [lockdates, setLockdates] = useState<Date[]>([])

  const [customFooter, setCustomFooter] = useState<JSX.Element>(<div className="my-2 flex flex-wrap gap-2">
    <Badge className="text-white bg-red-500">Full</Badge>
    <Badge className="text-white bg-orange-500">With hours vaccant</Badge>
  </div>)
  const [subtotal, setSubtotal] = useState<number>(0)
  const [rescheduleFee, setRescheduleFee] = useState<number>(0)
  const [coverTheFees, setCoverTheFees] = useState<boolean>(false)
  const [rescheduleReason, setRescheduleReason] = useState<string>("")
  const [activeCoupons, setActiveCoupons] = useState<z.infer<typeof coupons>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getOccupiedDates(booking.package.id)
      setFetching(false)

      if (response.status == 500) {
        setError(true)
        setErrorReport(response.error as string)
        return
      }

      if (response.status == 200) {
        // for each date that exist in bookings, I need to count the bookings of that date
        const dates = response.data?.map((item) => {
          const collection: Date[] = []
          for (let i = 0; i < item.quantity; i++) {
            collection.push(...eachDayOfInterval({ start: item.checkin, end: item.checkout }))
          }
          return collection
        })
          .flat() as Date[]
        setLockdates(dates)
        return
      }
    }

    fetchData()

  }, [])

  useEffect(() => {
    // segragate the coupons
    const percents = activeCoupons.filter((x) => x.percent).reduce((a, b) => a + b.amount, 0)
    const absolutes = activeCoupons.filter((x) => !x.percent).reduce((a, b) => a + b.amount, 0)

    const absolutesdeducted = subtotal - absolutes // deduce the absolute values first
    if (absolutesdeducted < 0) {
      setRescheduleFee(0) // set the fee to zero if nothing's left
      return
    }

    const percentsapplied = absolutesdeducted - (absolutesdeducted * (percents / 100)) // apply the percentage discount

    setRescheduleFee(percentsapplied) // assign the rescheduling fee
  }, [subtotal, activeCoupons])

  const handleSetDate = (date: Date | undefined) => {
    setDateError("")
    let timeinHours: number = 0
    let timeinMinutes: number = 0

    if (date) {

      if (booking.slot == "day") {
        timeinHours = parseInt(booking.package.day_tour.timein.split(":")[0])
        timeinMinutes = parseInt(booking.package.day_tour.timein.split(":")[1])
      }
      if (booking.slot == "night") {
        timeinHours = parseInt(booking.package.night_tour.timein.split(":")[0])
        timeinMinutes = parseInt(booking.package.night_tour.timein.split(":")[1])
      }
      if (booking.slot == "regular") {
        timeinHours = parseInt(booking.package.regular_stay.timein.split(":")[0])
        timeinMinutes = parseInt(booking.package.regular_stay.timein.split(":")[1])
      }

      // get all the record of the date from the occupied array
      // concat each time lock into a string
      const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)).length

      if ((count + booking.quantity) > quantity) {
        setDateError(`${Math.max(quantity - count, 0)} slot/s available!`)
        message.error("You cannot move to this date!")
      }


      if (count > 0) {
        const footer = (
          <>
            <p className="py-2 whitespace-wrap text-xs">{`${count} occupied.`}</p>
            <div className="my-2 flex flex-wrap gap-2">
              <Badge className="text-white bg-red-500">Full</Badge>
              <Badge className="text-white bg-orange-500">With slots left</Badge>
            </div>
          </>
        )

        setCustomFooter(footer)
      } else {
        setCustomFooter((<div className="my-2 flex flex-wrap gap-2">
          <Badge className="text-white bg-red-500">Full</Badge>
          <Badge className="text-white bg-orange-500">With slots left</Badge>
        </div>))
      }

      const datestart = new Date(date.setHours(timeinHours, timeinMinutes, 0, 0))
      let dateend: Date = new Date();

      setNewCheckin(datestart)

      if (booking.slot == "day") {
        dateend = add(datestart, { hours: booking.package.day_tour.duration })
      }
      if (booking.slot == "night") {
        dateend = add(datestart, { days: booking.days - 1, hours: booking.package.night_tour.duration })
      }
      if (booking.slot == "regular") {
        const timeoutHours = parseInt(booking.package.regular_stay.timeout.split(":")[0])
        const timeoutMinutes = parseInt(booking.package.regular_stay.timeout.split(":")[1])
        dateend = new Date(new Date(datestart).setHours(timeoutHours, timeoutMinutes, 0, 0))
      }

      setNewCheckout(dateend)

      // 
      const diff = Math.abs(differenceInDays(date, booking.checkin))
      if (diff < 30) {
        setSubtotal(300)
      } else {
        setSubtotal(diff * 10)
      }

      // validate the dates
      const userdaterange = eachDayOfInterval({ start: datestart, end: dateend })
      const isValidSelection = !userdaterange.some(date => lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length >= booking.package.quantity);

      if (!isValidSelection) {
        message.error("Please try other dates!")
        return
      }

    }
  }

  const getSelected = () => {
    if (newCheckin) { // select all the dates that will occupy

      if (booking.slot == "day") { // not continues
        return { from: newCheckin, to: newCheckout }
      }
      if (booking.slot == "night") { // if continues 
        let tempDateout = new Date()

        const timeinHours = parseInt(booking.package.night_tour.timein.split(":")[0])
        const timeinMinutes = parseInt(booking.package.night_tour.timein.split(":")[1])
        const duration = booking.package.night_tour.duration
        // then calculate the timein and timeout for each day looping, to get the ending date of the reservation
        for (let i = 0; i < booking.days; i++) {
          // add the hours and minutes of the timein
          // then add the duration of the package
          tempDateout = moment(add(new Date(new Date(newCheckin).setHours(timeinHours, timeinMinutes, 0, 0)), { days: i, hours: duration })).toDate()
        }
        return { from: newCheckin, to: tempDateout }
      }
      if (booking.slot == "regular") {

        const timeinHours = parseInt(booking.package.regular_stay.timeout.split(":")[0])
        const timeinMinutes = parseInt(booking.package.regular_stay.timeout.split(":")[1])

        const dateOut = new Date(new Date(newCheckin).setHours(timeinHours, timeinMinutes, 0, 0))
        return { from: newCheckin, to: dateOut }
      }

    } else { // select single date
      return false
    }
  }

  const handleConfirmReschedule = async () => {

    if (!newCheckin || !newCheckout) {
      message.error("Unidentified date!")
      return
    }

    const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === new Date(newCheckin).setHours(0, 0, 0, 0)).length

    if ((count + booking.quantity) > quantity) {
      setDateError(`${Math.max(quantity - count, 0)} slot/s available!`)
      message.error("You cannot move to this date!")
      return
    }

    // validate the dates
    const userdaterange = eachDayOfInterval({ start: newCheckin, end: newCheckout })
    const isValidSelection = !userdaterange.some(date => lockdates.filter((item) => item.setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)).length >= quantity);

    if (!isValidSelection) {
      message.error("Please try other dates!")
      return
    }

    const isTheSame = areIntervalsOverlapping({ start: booking.checkin, end: booking.checkout }, { start: newCheckin, end: newCheckout })

    if (isTheSame) {
      message.error("No changes made!")
      return
    }

    setLoading("Moving dates, please wait...")
    const response = await rescheduleBooking(booking.id, newCheckin, newCheckout, rescheduleFee, coverTheFees, activeCoupons.map((item) => item.id), rescheduleReason)
    setLoading("")

    if (response.status == 500) {
      message.error("Unable to process your request, internal server error!")
      return
    }

    const temp = format(newCheckin, "MMMM do yyyy, hh:mm a") + " - " + format(newCheckout, "MMMM do yyyy, hh:mm a")
    const b64 = Buffer.from(temp).toString('base64')

    router.push(`/reschedule/${booking.bookingid}/complete?data=${b64}`)

  }

  const checkValidity = () => {
    if (error) return true // if there is an error
    if (!newCheckin) return true // if there's no date
    if (dateError.length > 0) return true // if there are date errors
    if (isAdmin && rescheduleReason.length == 0) return true

    return false
  }

  return (
    <>
      {
        error ? (
          <div className="w-full sm:w-1/2 text-center py-6">
            <p className="text-sm text-red-500">Fetching error, please try again later...</p>
            <span className="text-blue-500 text-sm hover:underline cursor-pointer" onClick={() => {
              const reported = sessionStorage.getItem("errors")
              if (reported) {
                const reports = JSON.parse(reported)
                if (reports.some((item: string) => item == "CMP-ERR-0004")) {
                  message.success("Submitted an error report.")
                  return
                }
              }
              setOpenReportModal(true)
            }}>Report the problem</span>
            <StaleReport
              open={openReportModal}
              close={() => {
                setOpenReportModal(false)
              }}
              error={errorReport}
              code="CMP-ERR-0004"
            />
          </div>
        ) : fetching ? (
          <>
            <div className="block space-y-2 sm:space-y-0 sm:flex items-center gap-2">
              <Skeleton className="w-full sm:w-1/2 h-8 bg-gray-500" />
              <Skeleton className="w-full sm:w-1/2 h-8" />
            </div>
            <Separator className="my-4" />
            <div className='space-y-2'>
              <div className="w-1/2 flex justify-between">
                <p className="font-semibold">Charge summary</p>
                <p className="line-through"></p>
              </div>
              <Separator className="w-1/2" />
              <div className="w-full sm:w-1/2 pl-4 flex justify-between">
                <p className="font-semibold">Total:</p>
                <p>&#8369; {rescheduleFee.toLocaleString()}</p>
              </div>
              <Skeleton className="w-full sm:w-1/2 h-8" />
              <p className="w-full sm:w-1/2 text-sm text-gray-500">Please note that all rescheduling charges will be paid on-site upon your arrival.</p>
            </div>
            <br />
            <Skeleton className="w-full sm:w-1/2 h-8 bg-gray-500" />
            <p className="text-sm text-blue-500 pt-2">Please read the rescheduling policy and how it works. If you have any concern, please contact us on AR chat or message us on our facebook page.</p>
          </>
        ) : (
          <>
            <div className="block space-y-2 sm:space-y-0 sm:flex items-center gap-2">
              <div className="w-full sm:w-1/2">
                <Label>New Date/Time-in</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newCheckin && "text-muted-foreground",
                        false && "border-red-500 text-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCheckin ? format(newCheckin, "MMMM do yyyy, h:mm a") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="overflow-hidden p-0">
                    <Calendar
                      mode="single"
                      selected={newCheckin}
                      onSelect={handleSetDate}

                      modifiers={{
                        partial: (date) => {
                          const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count < quantity
                        },
                        full: (date) => {
                          const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count >= quantity
                        },
                        selected: getSelected() as Matcher
                      }}

                      modifiersClassNames={{
                        partial: "text-orange-500 bg-orange-300/20",
                        full: "text-red-500 bg-red-300/20 opacity-70 pointer-events-none",
                        selected: "bg-prm text-white",
                      }}

                      footer={customFooter}

                      //check if the client package will fit in this date
                      disabled={(date) => {
                        if (dev.DEBUG && dev.checkout.freedate) {
                          return false
                        }

                        // disable all past date
                        if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
                          return true
                        }

                        // disable the today's date plus 3 days ahead
                        if (new Date(date) <= add(new Date(), { days: reservationConfig.leadtime }) && !isAdmin) {
                          return true
                        }

                        return false
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-full sm:w-1/2">
                <Label>New Date/Time-out</Label>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                  )}
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newCheckout ? format(newCheckout, "MMMM do yyyy, h:mm a") : <span>Pick a new date first</span>}
                </Button>
              </div>
            </div>
            <Separator className="my-4" />
            <div className='space-y-2'>
              <div className="w-1/2 flex justify-between">
                <p className="font-semibold">Charge summary</p>
                <p className="line-through"></p>
              </div>
              <Separator className="w-1/2" />
              {
                activeCoupons.length > 0 && (
                  <>
                    <div className="w-1/2 pl-4 flex justify-between">
                      <p className="font-semibold">Reschedule fee:</p>
                      <p className="line-through">&#8369; {subtotal.toLocaleString()}</p>
                    </div>
                    {
                      activeCoupons.map((item, i) => (
                        <div className="w-1/2 pl-8 flex justify-between text-sm" key={i}>
                          <p className="font-semibold">Coupon - {item.couponcode}</p>
                          <p key={i}>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                        </div>
                      ))
                    }
                    <Separator className="w-full sm:w-1/2" />
                  </>
                )
              }
              <div className="w-full sm:w-1/2 pl-4 flex justify-between">
                <p className="font-semibold">Total:</p>
                <p>&#8369; {rescheduleFee.toLocaleString()}</p>
              </div>
              {
                isAdmin ? (
                  <>
                    <div>
                      <Checkbox id="fee" checked={coverTheFees} onCheckedChange={(e) => setCoverTheFees(e as boolean)} className="mr-2" />
                      <Label htmlFor='fee'>Cover the fees</Label>
                    </div>
                    <br />
                    <div>
                      <Label>Rescheduling reason</Label>
                      <Select value={rescheduleReason} onValueChange={(e) => setRescheduleReason(e)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a valid reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Reason</SelectLabel>
                            {
                              reschedulingReasons.map((item, i) => (
                                <SelectItem value={item.value} key={i}>{item.name}</SelectItem>
                              ))
                            }
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-sm">Please provide a reason for changing the date of the client booking.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <br />
                    <ApplyCoupons
                      className="w-full sm:w-1/2"
                      activeCoupons={activeCoupons}
                      setActiveCoupons={setActiveCoupons}
                      subtotal={rescheduleFee}
                      type="reschedule"
                    />
                  </>
                )
              }
              <p className="w-full sm:w-1/2 text-sm text-gray-500">Please note that all rescheduling charges will be paid on-site upon your arrival.</p>
            </div>
            <br />
            <Button
              className='bg-prm w-full sm:w-1/2'
              onClick={() => handleConfirmReschedule()}
              disabled={checkValidity()}>Confirm reschedule</Button>
            <FormError className="w-1/2" message={dateError} />
            <p className="text-sm text-blue-500 pt-2">Please read the rescheduling policy and how it works. If you have any concern, please contact us on AR chat or message us on our facebook page.</p>
            <FullCoverLoading open={(loading.length > 0)} defaultOpen={false} loadingLabel='Processing, please wait...' />
          </>
        )
      }

    </>
  )
}