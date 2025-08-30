'use client'

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Textarea } from "@/app/components/ui/textarea"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { createMaintenanceSchedule, getMaintenances } from "@/lib/actions/system-actions/system-maintenance"
import prisma from "@/lib/prisma"
import { cn } from "@/lib/utils/cn"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from 'antd'
import { add, areIntervalsOverlapping, eachDayOfInterval, format, sub } from "date-fns"
import { Calendar as CalendarIcon } from 'lucide-react'
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Matcher } from "react-day-picker"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function MaintenanceControls({ close }: { close: () => void }) {

  // context
  const { setReload } = useReload()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  // states
  const [fetching, setFetching] = useState<boolean>(true)
  const [fetchingError, setFetchingError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // values
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("00:00")
  const [list, setList] = useState<z.infer<typeof maintenanceschema>[]>([])
  const [customFooter, setCustomFooter] = useState<JSX.Element>(<></>)

  const maintenancescheduletype = maintenanceschema.omit({
    id: true,
    status: true,
    initiatorid: true,
    initiator: true,
    start: true,
    end: true,
    issuedate: true,
    lastupdated: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMaintenances()
      setFetching(false)

      if (response.status == 500) {
        setFetchingError(true)
        return
      }

      setList(response.data as z.infer<typeof maintenanceschema>[])
    }

    setFetching(true)
    fetchData()
  }, [])

  const form = useForm<z.infer<typeof maintenancescheduletype>>({
    resolver: zodResolver(maintenancescheduletype),
    defaultValues: {
      title: "",
      memo: "",
      type: "scheduled", // immediate | scheduled
      coverage: "", // all | website | admin
      duration: -1,
    }
  })

  const handleSelectDate = (date: Date) => {
    const selectedDate = new Date(date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])))
    const enddate = add(selectedDate, { hours: form.getValues("duration") })

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

  async function onSubmit(values: z.infer<typeof maintenancescheduletype>) {

    let schedulestart = add(new Date(), { minutes: 15 })
    let scheduleend = add(schedulestart, { hours: values.duration })

    if (values.type == "scheduled") {
      if (!date) return

      if (date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])) <= new Date().getTime()) {
        return
      }

      if (add(new Date(), { minutes: 15 }).getTime() > date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]))) { // 15 mins gap checking
        return
      }

      schedulestart = new Date((date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]))))
      scheduleend = add(schedulestart, { hours: values.duration })
    }

    for (let { start, end } of list) {
      const marginDate = sub(start, { minutes: 15 })
      const willOverlap = areIntervalsOverlapping({ start: schedulestart, end: scheduleend }, { start: marginDate, end: end }, { inclusive: true })

      if (willOverlap) {
        message.error("Maintenance schedule will overlap, please try again!")
        return
      }
    }

    let maintenance = {
      title: values.title,
      memo: values.memo,
      type: values.type,
      coverage: values.coverage,
      duration: values.duration,
      issuedate: new Date(),
      lastupdated: new Date(),
      start: schedulestart,
      end: scheduleend,
    }

    setLoading(true)
    const response = await createMaintenanceSchedule(maintenance as z.infer<typeof maintenanceschema>)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: `Unable to deploy a ${values.type.toLowerCase()} maintenance, please try again later!`,
        variant: "destructive"
      })
      return
    } else if (response.status == 403) {
      toast({
        title: "Unauthorized!",
        description: `Unable to deploy a ${values.type.toLowerCase()} maintenance, please try again later!`,
        variant: "destructive"
      })
      router.push(`/signin?callbackUrl=${pathname}`)
      return
    }

    toast({
      title: "Success!",
      description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    })
    setReload(true)
    close()
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="coverage"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance Coverage</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Coverage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website Only</SelectItem>
                    <SelectItem value="website-admin">Website and Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription>
                  Select the extent of the maintenance coverage.
                </FormDescription>
                {
                  field.value == "all" && (
                    <FormDescription className="text-sm text-red-500">Attention: toggling maintenance coverage to all, will prevent you as well on accessing the system admin panel.
                    </FormDescription>
                  )
                }
              </FormItem>
            )}
          >
          </FormField>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance Duration</FormLabel>
                <Select onValueChange={(e) => field.onChange(parseInt(e))}>
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

          <FormField
            control={form.control}
            name="type"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance Action</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    <SelectItem value="immediate">Start Immediately</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription >Choose whether to schedule maintenance or start it immediately. Note that selecting immediate maintenance will still apply a 15-minute delay before it takes effect.</FormDescription>
              </FormItem>
            )}
          />

          {
            form.watch().type == "scheduled" && (
              <>
                <FormItem>
                  <FormLabel>Maintenance Schedule</FormLabel><br />
                  <div className="flex gap-2">
                    {
                      fetching ? (
                        <>
                          <Skeleton className="h-8 w-[280px]" />
                          <Skeleton className="h-8 w-24" />
                        </>
                      ) : (
                        <>
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
                                modifiers={{
                                  scheduled: list.filter((item) => item.end != null).map((item) => item.start) as Matcher[],
                                  full: list.filter((item) => item.end == null).map((item) => item.start) as Matcher[],
                                  // selected: date || new Date()
                                }}
                                disabled={(date) => {
                                  if (form.watch("duration") == 0 && list.sort((a, b) => b.start.getTime() - a.start.getTime())[0].start.setHours(0, 0, 0, 0) >= date.getTime()) {
                                    setDate(undefined)
                                    return true
                                  }
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
                        </>
                      )
                    }
                  </div>
                  <Input value={(() => {
                    let copyDate = date
                    if (!copyDate) return "Waiting for date..."
                    let [hours, minutes] = time.split(":").map(Number);
                    // Set the hours and minutes on the date
                    copyDate.setHours(hours, minutes, 0, 0);
                    return format(copyDate, "PPP hh:mm a")
                  })()} className="w-[280px]" disabled />

                  {
                    !date ? (
                      <FormDescription className="text-red-500">Select a schedule.</FormDescription>
                    ) : date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])) <= new Date().getTime() ? (
                      <FormDescription className="text-red-500">Invalid schedule!</FormDescription>
                    ) : add(new Date(), { minutes: 15 }).getTime() > date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1])) && (
                      <FormDescription className="text-red-500">Please put a 15 mins margin!</FormDescription>
                    )
                  }
                  <FormDescription className="text-sm">
                    Choose a schedule date for your maintenance.
                  </FormDescription>
                </FormItem>
              </>
            )
          }

          <FormField
            control={form.control}
            name="title"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance Label</FormLabel>
                <FormControl>
                  <Input className="max-w-[50%]" placeholder="Label" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memo"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Maintenance description</FormLabel>
                <FormControl>
                  <Textarea className="max-w-[50%]" placeholder="description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <br />

          <div className="flex justify-end">
            <Button
              variant={!fetchingError ? "default" : "destructive"}
              disabled={fetching || fetchingError}>

              {
                fetching ? (
                  <p>Loading..</p>
                ) : fetchingError ? (
                  <p>Error, try again later</p>
                ) : form.watch().type == "scheduled" ? (
                  "Schedule maintenance"
                ) : (
                  "Apply maintenance"
                )
              }</Button>
          </div>
        </form>
      </Form>

      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel={`Deploying ${form.getValues("type")} maintenance, please wait...`} />
    </>
  )
}