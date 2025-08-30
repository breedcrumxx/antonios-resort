"use client"

import { useCheckout } from "@/app/checkout/provider"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Skeleton } from "@/app/components/ui/skeleton"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { cn } from "@/lib/utils"
import { StaleReport } from "@/lib/utils/error-report-modal"
import { getOccupiedDates } from "@/lib/utils/get-occupied-dates"
import { getTimein } from "@/lib/utils/package-timein-timeout"
import { message } from "antd"
import { add, eachDayOfInterval, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import moment from "moment"
import { useEffect, useState } from "react"
import { Matcher } from "react-day-picker"
import { usePackageData } from "../../../providers/package-data-provider"

export function DateSetPicker() {

  // context
  const { dev } = useDevs()
  const { packagedata } = usePackageData()
  const {
    dateStart,
    setDateStart,
    dateEnd,
    setDateEnd,
    nights,
    setNights,
    setToggleErrors,
    toggleErrors,
    reservationConfig,
    slot,
    setSlot,
    currentSlot,
    setCurrentSlot,
    sets,
    setSets,
  } = useCheckout();

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorReport, setErrorReport] = useState<string>("")
  const [openReportModal, setOpenReportModal] = useState<boolean>(false)

  // values
  const [customFooter, setCustomFooter] = useState<JSX.Element>(<div className="my-2 flex flex-wrap gap-2">
    <Badge className="text-white bg-red-500">Full</Badge>
    <Badge className="text-white bg-orange-500">With slots left</Badge>
  </div>)

  const [lockdates, setLockdates] = useState<Date[]>([])

  useEffect(() => {
    let intervalID: NodeJS.Timeout;

    const fetchData = async () => {
      if (!packagedata) return

      const response = await getOccupiedDates(packagedata.id)
      setLoading(false)

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
      message.error("Unknown error occured!")
      setErrorReport("Unable to get the dates!")
      setError(true)
    }

    if (packagedata) {
      fetchData()

      intervalID = setInterval(fetchData, 5000) // rerun every 5 seconds
    }

    return () => clearInterval(intervalID) // clear the interval on unmount
  }, [packagedata])

  useEffect(() => {
    handleSetDate(dateStart)
  }, [slot])

  const handleSetDate = (date: Date | undefined) => {
    let timeinHours: number = 0
    let timeinMinutes: number = 0

    if (packagedata && date) {

      if (slot == "day") {
        timeinHours = parseInt(packagedata.day_tour.timein.split(":")[0])
        timeinMinutes = parseInt(packagedata.day_tour.timein.split(":")[1])
      }
      if (slot == "night") {
        timeinHours = parseInt(packagedata.night_tour.timein.split(":")[0])
        timeinMinutes = parseInt(packagedata.night_tour.timein.split(":")[1])
      }
      if (slot == "regular") {
        timeinHours = parseInt(packagedata.regular_stay.timein.split(":")[0])
        timeinMinutes = parseInt(packagedata.regular_stay.timein.split(":")[1])
      }

      // get all the record of the date from the occupied array
      // concat each time lock into a string
      const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length

      setCurrentSlot(packagedata.quantity - count)

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

      setToggleErrors((prev) => ({ ...prev, date: false }))

      const datestart = new Date(date.setHours(timeinHours, timeinMinutes, 0, 0))
      let dateend: Date = new Date();

      setDateStart(datestart)

      if (slot == "day") {
        dateend = add(datestart, { hours: packagedata.day_tour.duration })
      }
      if (slot == "night") {
        dateend = add(datestart, { days: nights - 1, hours: packagedata.night_tour.duration })
      }
      if (slot == "regular") {
        const timeoutHours = parseInt(packagedata.regular_stay.timeout.split(":")[0])
        const timeoutMinutes = parseInt(packagedata.regular_stay.timeout.split(":")[1])
        dateend = new Date(new Date(datestart).setHours(timeoutHours, timeoutMinutes, 0, 0))
      }

      setDateEnd(dateend)

      // validate the dates
      const userdaterange = eachDayOfInterval({ start: datestart, end: dateend })
      const isValidSelection = !userdaterange.some(date => lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length >= packagedata.quantity);

      if (!isValidSelection) {
        message.error("Please try other dates!")
        return
      }
    }

  }

  const getSelected = () => {
    if (packagedata && dateStart) { // select all the dates that will occupy

      if (slot == "day") { // not continues
        return { from: dateStart, to: dateEnd }
      }
      if (slot == "night") { // if continues 
        let tempDateout = new Date()

        const timeinHours = parseInt(packagedata.night_tour.timein.split(":")[0])
        const timeinMinutes = parseInt(packagedata.night_tour.timein.split(":")[1])
        const duration = packagedata.night_tour.duration
        // then calculate the timein and timeout for each day looping, to get the ending date of the reservation
        for (let i = 0; i < nights; i++) {
          // add the hours and minutes of the timein
          // then add the duration of the package
          tempDateout = moment(add(new Date(new Date(dateStart).setHours(timeinHours, timeinMinutes, 0, 0)), { days: i, hours: duration })).toDate()
        }
        return { from: dateStart, to: tempDateout }
      }
      if (slot == "regular") {

        const timeinHours = parseInt(packagedata.regular_stay.timeout.split(":")[0])
        const timeinMinutes = parseInt(packagedata.regular_stay.timeout.split(":")[1])

        const dateOut = new Date(new Date(dateStart).setHours(timeinHours, timeinMinutes, 0, 0))
        return { from: dateStart, to: dateOut }
      }

    } else { // select single date
      return false
    }
  }

  const getDateEnd = () => {
    if (dateStart && packagedata) {
      if (slot == "day") {
        return format(add(dateStart, { hours: packagedata.day_tour.duration }), packagedata.type == "event" ? "MMMM do yyyy" : "MMMM do yyyy, h:mm a")
      }
      if (slot == "night") {
        return format(add(dateStart, { days: nights, hours: packagedata.night_tour.duration }), packagedata.type == "event" ? "MMMM do yyyy" : "MMMM do yyyy, h:mm a")
      }
      if (slot == "regular") {
        const timeoutHours = parseInt(packagedata.regular_stay.timeout.split(":")[0])
        const timeoutMinutes = parseInt(packagedata.regular_stay.timeout.split(":")[1])
        return format(new Date().setHours(timeoutHours, timeoutMinutes), "MMMM do yyyy, h:mm a")
      }
    }
  }

  return (
    <>
      {
        error ? (
          <div className="w-1/2 text-center py-6">
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
              code="CMP-ERR-0006"
            />
          </div>
        ) : loading ? (
          <div className="space-y-2 my-2">
            <Skeleton className="h-4 w-2/6" />
            <Skeleton className="h-8 w-3/6" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1  /6" />
              <Skeleton className="h-4 w-2/6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-3/6" />
              <Skeleton className="h-8 w-3/6" />
            </div>
          </div>
        ) : packagedata && !loading && (
          <div className="space-y-2 my-2">
            {
              packagedata.type == "event" && (
                <>
                  <p className="text-sm ">For day events schedule {getTimein(packagedata.day_tour.timein)} - {getTimein(packagedata.day_tour.timeout)}</p>
                  <p className="text-sm ">For night events schedule {getTimein(packagedata.night_tour.timein)} - {getTimein(packagedata.night_tour.timeout)}</p>
                </>
              )
            }
            {
              packagedata.type != 'cottage' && (
                <>
                  <div className="w-full sm:w-1/2">
                    <Label>Package slot</Label>
                    <Select value={slot} onValueChange={(e) => {
                      if (e == "day") setNights(1)
                      setSlot(e as "day" | "night")
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Slot</SelectLabel>
                          <SelectItem value="day">Day tour</SelectItem>
                          <SelectItem value="night">Night tour</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )
            }
            {
              slot == "night" && packagedata.type == "villa" && (
                <div className="space-y-1">
                  <Label>Night/s {nights > 1 ? (
                    <>
                      (Check-in {moment(packagedata.night_tour.timein, 'HH:mm:ss').format('hh:mm a')} - check-out {
                        moment(add(moment(packagedata.night_tour.timein, 'HH:mm:ss').toString(), { hours: packagedata.night_tour.duration })).format('hh:mm a')
                      })
                    </>
                  ) : (
                    <>
                      (Check-in {moment(packagedata.night_tour.timein, 'HH:mm:ss').format('hh:mm a')} - check-out {
                        moment(add(moment(packagedata.night_tour.timein, 'HH:mm:ss').toString(), { hours: packagedata.night_tour.duration })).format('hh:mm a')
                      })
                    </>
                  )}</Label>
                  <div className="w-[50%] flex">
                    <div className="flex-grow relative">
                      <Input
                        type="number"
                        className={cn(
                          "w-full rounded-tr-none rounded-br-none",
                          toggleErrors.nights && "border-red-500 text-red-500"
                        )}
                        value={nights}
                        min={1}
                        readOnly
                      />
                      <p className="absolute right-10 top-1/2 -translate-y-2/4 text-sm opacity-70">Night/s</p>
                    </div>
                    <Button className="bg-prm rounded-none" onClick={() => setNights((prev) => prev + 1)}>+</Button>
                    <Button className="bg-prm rounded-tl-none rounded-bl-none" onClick={() => {
                      if (nights > 1) { // prevent from going to zero or below
                        setNights((prev) => prev - 1)
                      }
                    }}>-</Button>
                  </div>
                </div>
              )
            }

            <div className="w-full block space-y-2 sm:space-y-0 sm:flex gap-2">
              <div className="w-full sm:w-1/2">
                <Label>Check-in</Label>
                <br />
                <Popover open={toggleErrors.date || open} onOpenChange={(e) => setOpen(e)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateStart && "text-muted-foreground",
                        toggleErrors.date && "border-red-500 text-red-500"
                      )}
                      onClick={() => setOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateStart ? format(dateStart, packagedata.type == "event" ? "MMMM do yyyy" : "MMMM do yyyy, h:mm a") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="overflow-hidden p-0">
                    <Calendar
                      mode="single"
                      selected={(dateStart ? dateStart : undefined)}
                      onSelect={handleSetDate}

                      modifiers={{
                        partial: (date) => {
                          const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count < packagedata.quantity
                        },
                        full: (date) => {
                          const count = lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length
                          return count != 0 && count >= packagedata.quantity
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
                        if (new Date(date) <= add(new Date(), { days: reservationConfig.leadtime })) {
                          return true
                        }

                        return false
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {
                packagedata.type != "event" && (
                  <div className="w-full sm:w-1/2">
                    <Label>Reservation check-out</Label>
                    <br />
                    <Button
                      className="w-full border-[1px] justify-start bg-transparent hover:none text-black"
                      disabled>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {
                        dateStart ? (
                          <>
                            {getDateEnd()}
                          </>
                        ) : (
                          "Provide a date first."
                        )
                      }</Button>
                  </div>
                )
              }
            </div>

            {
              packagedata.type != "event" && (
                <div className="space-y-1">
                  <Label>Sets</Label>
                  <div className="w-full sm:w-[50%] flex">
                    <Input
                      type="number"
                      className={cn(
                        "w-full rounded-tr-none rounded-br-none",
                        toggleErrors.nights && "border-red-500 text-red-500"
                      )}
                      value={sets}
                      min={1}
                      readOnly
                    />
                    <Button className="bg-prm rounded-none" onClick={() => {
                      if (sets < currentSlot) {
                        setSets((prev) => prev + 1)
                      }
                    }}
                      disabled={!dateStart}>+</Button>
                    <Button className="bg-prm rounded-tl-none rounded-bl-none" onClick={() => {
                      if (sets > 1) { // prevent from going to zero or below
                        setSets((prev) => prev - 1)
                      }
                    }}
                      disabled={!dateStart}>-</Button>
                  </div>
                  <p className="text-sm">Number of {packagedata.type} you want to reserve.</p>
                </div>
              )
            }
          </div>
        )
      }
    </>

  )
}
