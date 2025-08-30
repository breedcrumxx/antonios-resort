'use client'

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ui/use-toast";
import { defaultReservationConfig, ReservationConfigType } from "@/lib/configs/config-file";
import { loadConfig, restoreDefault } from "@/lib/configs/load-config";
import { changesChecker } from "@/lib/utils/changes-checker";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@nextui-org/spinner";
import { message } from 'antd';
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from 'zod';

const ReservationConfigZodType = z.object({
  leadtime: z.coerce.number()
    .min(1, { message: "We cannot allow a lead time lower than 1!" })
    .max(7, { message: "We only allow up to 7 days lead time!" }),
  discountoverpax: z.number()
    .min(0, { message: "Invalid value!" })
    .max(20, { message: "Maximum discount value of 20%!" }),
  downpayment: z.number()
    .min(20, { message: "Please put a down payment value, minimum 20%!" })
    .max(50, { message: "Down payment value cannot exceed of 70%!" }),
  allowonlyfullpayment: z.boolean(),
  adults: z.number()
    .min(50, { message: "Please put an entrance fee, minimum 50!" }),
  seniorpwd: z.number()
    .min(50, { message: "Please put an entrance fee, minimum 50!" }),
  teenkids: z.number()
    .min(50, { message: "Please put an entrance fee, minimum 50!" }),
  checkincheckoutpenalty: z.number()
    .min(100, { message: "Please enter a penalty fee for early check-in and and late check-out!" }),
  secdeposit: z.number()
    .min(500, { message: "Please enter an amount for security deposit!" }),
  manager: z.string()
    .min(1, { message: "Please put the manager's name" }),
  assistant: z.string()
    .min(1, { message: "Please put the assistant manager's name" }),
})

export default function PaymentsConfigForm({ config }: { config: ReservationConfigType }) {

  const router = useRouter()

  // context
  const { toast } = useToast()

  // states
  const [loading, setLoading] = useState<string>("")

  const form = useForm<z.infer<typeof ReservationConfigZodType>>({
    resolver: zodResolver(ReservationConfigZodType),
    defaultValues: {
      leadtime: config.leadtime,
      discountoverpax: config.discountoverpax,
      downpayment: config.downpayment,
      allowonlyfullpayment: config.allowonlyfullpayment,
      adults: config.adults,
      seniorpwd: config.seniorpwd,
      teenkids: config.teenkids,
      checkincheckoutpenalty: config.checkincheckoutpenalty,
      manager: config.manager,
      assistant: config.assistant,
      secdeposit: config.securitydeposit
    }
  })

  // function to save the updated configuration
  async function onSubmit(values: z.infer<typeof ReservationConfigZodType>) {
    setLoading("Checking changes...")

    const hadChanged = changesChecker(values, config)

    if (!hadChanged) { // if there's no changes has been made to the data
      setLoading("")
      toast({
        title: 'No changes made!',
        description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
      })
      return
    }

    setLoading("Saving configuration...")
    // string the new reservation configuration
    const response = await loadConfig("reservationconfig", JSON.stringify(values), true)
    setLoading("")

    if (response.status == 500) {
      message.error("Unable to update the configuration!")
      return
    }

    message.success("Successfully updated reservation configuration")
    router.refresh()
  }

  // restore the reservation config
  const handleRestoreReservationConfig = async () => {
    setLoading("Please wait while we are restoring configuration to default...")

    // call the restore defaults for reservation config
    const response = await restoreDefault("reservationconfig", JSON.stringify(defaultReservationConfig))
    setLoading("")

    if (!response) {
      message.error("Unable to restore defaults.")
      return
    }

    message.success("Restored successfully!")
    router.refresh()
  }

  return (
    <div className="h-max p-4 overflow-y-scroll scroll">
      <div className="w-full flex justify-between items-center">
        <h1 className="font-semibold text-lg">Configure settings for reservations</h1>
        <Button className="text-blue-500 bg-transparent hover:bg-transparent hover:text-blue-400 hover:underline"
          onClick={() => handleRestoreReservationConfig()}
        >Restore default</Button>
      </div>
      <br />
      <div className="w-full px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <h1 className="font-semibold">Reservations constraints</h1>
            <FormField
              control={form.control}
              name="leadtime"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Reservation Lead Time</Label>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder="Set the minimum days..." />
                      </FormControl>
                      <p className="absolute right-5 top-1/2 -translate-y-2/4 text-sm opacity-70">Day/s</p>
                    </div>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      This setting determines the minimum number of days from today before a guest can make a reservation. For example, if set to 3, guests can only book dates starting from 3 days in the future.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkincheckoutpenalty"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Early check-in and check-out penalty fee</Label>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="penalty fee..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Penalty fees that will apply to early check-in and late check-out of bookings.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secdeposit"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Security deposit</Label>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="security deposit..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Amount as security deposit upon checking-in, defaults to 1,000. Only applicable to Villas.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Separator className="my-5" />
            <h1 className="font-semibold">Reservation discounts</h1>

            <FormField
              control={form.control}
              name="discountoverpax"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2">
                    <Label>Discount on pax more than 20</Label>
                    <div className="relative">
                      <FormControl>
                        <Input type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="Set a down payment percentage, defaults to 10%" />
                      </FormControl>
                      <p className="absolute right-5 top-1/2 -translate-y-2/4 text-sm opacity-70">%</p>
                    </div>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">Discount value that automatically apply for pax more than 20, defaults to 10%</p>
                  </div>
                </FormItem>
              )}
            />

            <Separator className="my-5" />
            <h1 className="font-semibold">Reservation payments</h1>

            <FormField
              control={form.control}
              name="downpayment"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Down payment percentage</Label>
                    <div className="relative">
                      <FormControl>
                        <Input type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="Set a down payment percentage, defaults to 50%" />
                      </FormControl>
                      <p className="absolute right-5 top-1/2 -translate-y-2/4 text-sm opacity-70">%</p>
                    </div>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">The down payment percentage is the portion of the total reservation cost that clients need to pay upfront. This amount secures their reservation, default 50%</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowonlyfullpayment"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Mandatory full payment for cottages</Label>
                    <div className="relative">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Enforce full payment for reserving public swimming and cottages.</p>
                  </div>
                </FormItem>
              )}
            />

            <Separator className="my-5" />
            <h1 className="font-semibold">Reservation entrance fees</h1>

            <FormField
              control={form.control}
              name="adults"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Adults 20-above</Label>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="Adult entrance fee..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Entrance fees for adults 20 and above.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seniorpwd"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Senior/PWDs</Label>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="senior/pwn entrance fee..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Entrance fee for senior and PWDs.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teenkids"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Teen/kids</Label>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="teen and kids entrance fee..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Entrance fee for teens and kids.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Separator className="my-5" />
            <h1 className="font-semibold">Current personels</h1>

            <FormField
              control={form.control}
              name="manager"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Manager</Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="name..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Current manager assigned.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistant"
              render={({ field }: any) => (
                <FormItem>
                  <div className="w-1/2 space-y-2 my-1">
                    <Label>Assistance manager</Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="name..." />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      Current assistant manager assigned.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <br />
            <br />
            <Button>Update settings</Button>
          </form>
        </Form>
      </div>

      <Dialog open={(loading.length > 0)}>
        <DialogContent className="bg-transparent border-none shadow-none pointer-event-none" disableclose={true}>
          <Spinner label={loading}
            size="lg"
            classNames={{
              circle1: "border-b-white",
              circle2: "border-b-white",
              label: "text-white text-sm"
            }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}