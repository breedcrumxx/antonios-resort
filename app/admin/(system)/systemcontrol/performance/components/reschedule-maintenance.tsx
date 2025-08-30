'use client'

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { getMaintenances, updateSystemMaintenance } from "@/lib/actions/system-actions/system-maintenance"
import { cn } from "@/lib/utils/cn"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { add, areIntervalsOverlapping, eachDayOfInterval, format, sub } from "date-fns"
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from "react"
import { Matcher } from "react-day-picker"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { md5Checker } from "@/lib/utils/md5-checker"
import { message } from "antd"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import FullCoverLoading from "@/lib/utils/full-cover-loading"

export default function RescheduleMaintenance({ data, close }: { data: z.infer<typeof maintenanceschema>, close: () => void }) {

  // context 
  const { toast } = useToast()
  const { setReload } = useReload()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [date, setDate] = useState<Date>(new Date(data.start))
  const [time, setTime] = useState<string>(format(data.start, "HH:mm"))
  const [list, setList] = useState<z.infer<typeof maintenanceschema>[]>([])
  const [customFooter, setCustomFooter] = useState<JSX.Element>(<></>)

  const modifiedmaintenance = maintenanceschema.omit({
    id: true,
    title: true,
    memo: true,
    type: true,
    coverage: true,
    status: true,
    issuedate: true,
    lastupdated: true,
    start: true,
    end: true,
    initiatorid: true,
    initiator: true,
  })

  const form = useForm<z.infer<typeof modifiedmaintenance>>({
    resolver: zodResolver(modifiedmaintenance),
    defaultValues: {
      duration: data.duration
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMaintenances(data.id)
      setFetching(false)

      if (response.status == 500) {
        setError(true)
        return
      }

      setList(response.data as z.infer<typeof maintenanceschema>[])
    }

    fetchData()

  }, [])

  const handleSelectDate = (date: Date) => {
    const selectedDate = new Date(date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])))
    const enddate = add(selectedDate, { hours: form.getValues("duration") })

    console.log(list)
    let maintenancesthatday: string[] = []
    for (let { start, end } of list) {
      // check if the selected date is in the selection list
      if (new Date(start).setHours(0, 0, 0, 0) === new Date(end).setHours(0, 0, 0, 0)) {           // same day
        if (new Date(selectedDate).setHours(0, 0, 0, 0) === new Date(start).setHours(0, 0, 0, 0)) {
          maintenancesthatday.push(`${format(start, "h:mm a")} - ${format(end, "h:mm a")}`)
        }
      } else { // will extend

        const dates = eachDayOfInterval({ start, end })

        console.log(dates)

        for (const curr of dates) {
          if (new Date(curr).setHours(0, 0, 0, 0) === new Date(selectedDate).setHours(0, 0, 0, 0)) {
            const index = dates.indexOf(curr)

            if (index == 0) { // start element
              maintenancesthatday.push(`${format(start, "h:mm a")} - ${format(new Date(curr.setHours(23, 59, 59, 999)), "h:mm a")}`)
            }

            if (index > 0 && index < (dates.length - 1)) { // middle element
              maintenancesthatday.push(`${format(new Date(curr.setHours(0, 0, 0, 0)), "h:mm a")} - ${format(new Date(curr.setHours(23, 59, 59, 999)), "h:mm a")}`)
            }

            if (index == (dates.length - 1)) { // last element
              maintenancesthatday.push(`${format(new Date(curr.setHours(0, 0, 0, 0)), "h:mm a")} - ${format(end, "h:mm a")}`)
            }
          }
        }
      }
    }

    setCustomFooter(<>
      <p className="text-sm font-semibold">Maintenances</p>
      <p className="text-xs">{maintenancesthatday.join((", "))}</p>
    </>)

    setDate(new Date(date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]))))
  }

  async function onSubmit(values: z.infer<typeof modifiedmaintenance>) {

    const updateddate = date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]), 0, 0)
    const currentdate = new Date(data.start).getTime()

    if (updateddate == currentdate && values.duration == data.duration) {
      message.error("No changes made!")
      return
    }

    const modifieddata = {
      id: data.id,
      start: new Date(updateddate),
      end: add(updateddate, { hours: values.duration }),
      duration: values.duration,
    }

    if (data.type == "scheduled") {
      if (updateddate <= new Date().getTime()) { // less than or equal the current time
        return
      }

      if (add(new Date(), { minutes: 15 }).getTime() > updateddate) { // 15 mins gap checking
        return
      }
    }

    for (let { start, end } of list) {
      const marginDate = sub(start, { minutes: 15 })
      const willOverlap = areIntervalsOverlapping({ start: modifieddata.start, end: modifieddata.end }, { start: marginDate, end: end }, { inclusive: true })

      if (willOverlap) {
        message.error("Maintenance schedule will overlap, please try again!")
        return
      }
    }

    setLoading(true)
    const response = await updateSystemMaintenance(modifieddata as unknown as z.infer<typeof maintenanceschema>)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to reschedule the maintenance, please try again later!",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Successfully rescheduled!",
      description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    })
    setReload(true)
    close()

  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance Duration</FormLabel>
                <Select value={field.value.toString()} onValueChange={(e) => field.onChange(parseInt(e))}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="4">4 Hours</SelectItem>
                    <SelectItem value="24">1 Day</SelectItem>
                    {/* <SelectItem value="0">Until we are ready</SelectItem> */}
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription>Specify the expected duration of the maintenance.</FormDescription>
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Popover
              modal={true}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={fetching}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="overflow-hidden p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) handleSelectDate(selectedDate)
                  }}
                  // selected={selectedDate}
                  // onSelect={handleSetDate}

                  modifiers={{
                    scheduled: list.filter((item) => item.end != null).map((item) => item.start) as Matcher[],
                    full: list.filter((item) => item.end == null).map((item) => item.start) as Matcher[],
                    // selected: date || new Date()
                  }}

                  disabled={(date) => {
                    // if (form.watch("duration") == 0 && list.sort((a, b) => b.start.getTime() - a.start.getTime())[0].start.setHours(0, 0, 0, 0) >= date.getTime()) {
                    //   setDate(undefined)
                    //   return true
                    // }

                    if (list.filter((item) => item.duration == 0)
                      .some((item) => date.getTime() > item.start.getTime())) return true

                    return date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                  }}

                  modifiersClassNames={{
                    scheduled: "text-orange-500 bg-orange-300/20",
                    full: "text-red-500 bg-red-300/20 opacity-70 pointer-events-none"
                  }}

                  footer={customFooter}
                />
              </PopoverContent>
            </Popover>
            <Input className="w-max" type="time" value={time || "00:00"} onChange={(e) => setTime(e.target.value)} disabled={fetching} />
          </div>
          {
            !date ? (
              <FormDescription className="text-red-500">Select a schedule.</FormDescription>
            ) : date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])) <= new Date().getTime() ? (
              <FormDescription className="text-red-500">Invalid schedule!</FormDescription>
            ) : add(new Date(), { minutes: 15 }).getTime() > date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])) && (
              <FormDescription className="text-red-500">Please put a 15 mins margin!</FormDescription>
            )
          }

          <br />

          <div className="flex justify-end">
            <Button disabled={fetching}>{fetching ? "Loading..." : "Reschedule"}</Button>
          </div>
        </form>
      </Form>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Rescheduling, please wait..." />
    </>
  )
}