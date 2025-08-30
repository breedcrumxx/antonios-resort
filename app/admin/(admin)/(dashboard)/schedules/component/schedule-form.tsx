'use client'

import { Button } from "@/app/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { createDefaultSchedule, updateDefaultSchedule } from "@/lib/actions/schedule-actions/schedule-actions"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { defaultschedules } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod'

export default function ScheduleForm({ data, close }: { data?: z.infer<typeof defaultschedules>, close: () => void }) {

  const { toast } = useToast()
  const { setReload } = useReload()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  const insertDefaultSchedule = defaultschedules.omit({
    id: true,
    status: true,
    price: true,
  })

  const form = useForm<z.infer<typeof insertDefaultSchedule>>({
    resolver: zodResolver(insertDefaultSchedule),
    defaultValues: {
      type: data ? data.type : "",
      slot: data ? data.slot : "",
      timein: data ? data.timein : "",
      timeout: data ? data.timeout : "",
      duration: data ? data.duration : 0,
    }
  })

  const onSubmit = async (values: z.infer<typeof insertDefaultSchedule>) => {
    setLoading(true)
    let response: { status: number }
    if (data) {
      // update
      const updatedData: z.infer<typeof defaultschedules> = {
        ...data,
        ...values,
      }
      response = await updateDefaultSchedule(updatedData)
    } else {
      // create 
      response = await createDefaultSchedule(values)
    }
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to create a default schedule!",
        variant: "destructive"
      })
      return
    }

    if (response.status == 200) {
      toast({
        title: "Updated successfully!",
        description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
      })
    }
    if (response.status == 201) {
      toast({
        title: "Created successfully!",
        description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
      })
    }

    setReload(true)
    close()
  }

  useEffect(() => {
    if (form.getValues("type") == 'cottage') {
      form.setValue('slot', 'regular')
      form.resetField('timeout')
      form.setValue('duration', 5)
    } else {
      form.resetField('duration')
      form.setValue('slot', 'day')
      form.setValue('timeout', "00:00")
    }
  }, [form.watch().type])

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            name="type"
            control={form.control}
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl></FormControl>
                <Select value={field.value} onValueChange={(e) => {

                  field.onChange(e)
                }}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      <SelectItem value="villa">VILLA</SelectItem>
                      <SelectItem value="event">EVENT CENTER</SelectItem>
                      <SelectItem value="cottage">COTTAGE</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            name="slot"
            control={form.control}
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Slot</FormLabel>
                <FormControl></FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={form.watch().type == "cottage"}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Slot</SelectLabel>
                      <SelectItem value="day">Day tour</SelectItem>
                      <SelectItem value="night">Night tour</SelectItem>
                      <SelectItem value="regular" disabled={form.watch().type != "cottage"}>Regular stay</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            name="timein"
            control={form.control}
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Check-in time</FormLabel>
                <FormControl>
                  <Input type="time" value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            form.watch().type != 'cottage' ? (
              <FormField
                name="duration"
                control={form.control}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value.toString()} onChange={(e) => field.onChange(parseInt(e.target.value))} placeholder="duration..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                name="timeout"
                control={form.control}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Check-out time {form.watch().type == 'event' && "(Up-to)"}</FormLabel>
                    <FormControl>
                      <Input type="time" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          {
            form.watch().type == "event" && (
              <FormField
                name="timeout"
                control={form.control}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Check-out time {form.watch().type == 'event' && "(Up-to)"}</FormLabel>
                    <FormControl>
                      <Input type="time" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          <div className="flex justify-end">
            <Button>Create default schedule</Button>
          </div>
        </form>
      </Form>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Creating default schedule, please wait..." />
    </div>
  )
}