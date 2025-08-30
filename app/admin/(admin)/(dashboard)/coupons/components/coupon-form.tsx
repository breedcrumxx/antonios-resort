'use client'

import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { DialogFooter } from "@/app/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useToast } from "@/app/components/ui/use-toast";
import { useReload } from "@/app/providers/reloader";
import { deployCoupon, updateCoupon } from "@/lib/actions/coupon-actions/coupon-actions";
import FullCoverLoading from "@/lib/utils/full-cover-loading";
import { coupons, extendedcoupons } from "@/lib/zod/z-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { add, format } from "date-fns";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CouponForm({ data, close }: { data?: z.infer<typeof extendedcoupons>, close: () => void }) {

  const ref = useRef<HTMLFormElement | null>(null)

  const { toast } = useToast()
  const { setReload } = useReload()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  const newcoupontype = coupons.omit({
    id: true,
    couponcode: true,
    create_at: true,
    validuntil: true,
    status: true,
  }).extend({
    claimableperiod: z.number().gte(1, { message: "Please select a claimable period!" })
  })

  const form = useForm<z.infer<typeof newcoupontype>>({
    resolver: zodResolver(newcoupontype),
    defaultValues: {
      couponname: data?.couponname || "",
      coupondescription: data?.coupondescription || "",
      claimableperiod: data ? 1 : 0,
      max: data?.max || 0,
      type: data?.type || "",
      amount: data?.amount || 0,
      minamount: data?.minamount || 0,
      percent: data?.percent ? true : false,
      applicableto: data?.applicableto || "cottage",
    }
  })

  async function onSubmit(values: z.infer<typeof newcoupontype>) {

    if (data) { // update
      if (values.max < data.userids.length) {
        message.error("Unable to reduce max count of coupons!")
        return
      }

      let replica = data

      replica.couponname = values.couponname
      replica.coupondescription = values.couponname
      replica.max = values.max
      replica.type = values.type

      setLoading(true)
      const response = await updateCoupon(replica)
      setLoading(false)

      if (response.status == 500) {
        toast({
          title: "An error occured!",
          description: "Unable to update coupon details, please try again later!",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Updated a coupon!",
        description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")
      })


    } else { // create
      setLoading(true)

      const replica: z.infer<typeof coupons> = {
        id: "",
        couponcode: "",
        couponname: values.couponname,
        coupondescription: values.coupondescription,
        create_at: new Date(),
        status: "Active",
        validuntil: add(new Date(), { days: values.claimableperiod }),
        type: values.type,
        max: values.max,
        amount: values.amount,
        minamount: values.minamount,
        percent: values.percent,
        applicableto: values.applicableto,
      }

      const response = await deployCoupon(replica)
      setLoading(false)

      if (response.status == 500) {
        toast({
          title: "An error occured!",
          description: "Unable to deploy new coupon, please try again later!",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Deployed a new coupon!",
        description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")
      })
    }

    setReload(true)
    close()
  }

  return (
    <>
      <div className="flex-grow px-2 overflow-y-scroll scroll">
        <Form {...form}>
          <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="couponname"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Coupon name</FormLabel>
                  <FormControl>
                    <Input placeholder="coupon name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coupondescription"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Decription</FormLabel>
                  <FormControl>
                    <Input placeholder="description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Discount value</FormLabel>
                  <FormControl>
                    <Input
                      type={"number"}
                      max={form.watch().percent ? 30 : undefined}
                      placeholder="discount value..."
                      value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percent"
              render={({ field }: any) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Value as percentage</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minamount"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Minimum spend</FormLabel>
                  <FormControl>
                    <Input type={"number"} placeholder="Minimum valid amount..." value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicableto"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Applied to</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Where is this coupon applied to?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cottage">Cottages</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="event">Event Center</SelectItem>
                      <SelectItem value="reschedule">Reschedule</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Available quantity</FormLabel>
                  <FormControl>
                    <Input type={"number"} placeholder="max available coupons..." value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {
              !data && (
                <FormField
                  control={form.control}
                  name="claimableperiod"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Claimable period</FormLabel>
                      <Select onValueChange={(e) => field.onChange(parseInt(e))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select validity..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <FormDescription>
                        This refers to the date up until which the coupon can be claimed before it becomes unavailable.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )
            }

            <FormField
              control={form.control}
              name="type"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Coupon availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="selected">Selected Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormDescription>
                    <span>Anyone: The coupon will be publicly available on the website.</span><br />
                    <span>Private: The coupon is available to users with the coupon code.</span>
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Deploying, please wait..." />
      </div>
      <DialogFooter>
        <Button
          onClick={() => ref.current?.requestSubmit()}
          className="self-end">{data ? "Update coupon" : "Deploy coupon"}</Button>
      </DialogFooter>
    </>
  );
}