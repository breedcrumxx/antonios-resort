'use client'

import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"
import { useForm } from "react-hook-form"
import { concernform } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form"
import { useState } from "react"
import { Spinner } from "@nextui-org/spinner"
import { sendConcern } from "./send-concern"
import { message } from "antd"
import { FormError } from "@/lib/ui/form-banners"

export default function ConcernForm() {

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const form = useForm<z.infer<typeof concernform>>({
    resolver: zodResolver(concernform),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      concern: "",
    }
  })

  const onSubmit = async (values: z.infer<typeof concernform>) => {
    setError("")
    setLoading(true)
    const response = await sendConcern(values)
    setLoading(false)

    if (response.status == 500) {
      message.error("Unable to send your concern, please try again later!")
      setError("Unable to send your concern!")
      return
    }

    message.success("Thank you for reaching out to us, we will try to response as soon as possible!")
    form.reset()
  }

  return (
    <div id="form" className="w-full flex justify-center pb-10">
      <div className="w-[600px] space-y-2">
        <h1 className="text-4xl sm:text-6xl text-center font-semibold elegant">Reach out to us!</h1>
        <p className="text-sm text-center">We value your feedback and inquiries! If you have any questions, concerns, or suggestions, please don&apos;t hesitate to get in touch with us. Fill out the form below with your details, and let us know how we can assist you.</p>
        <br />
        <FormError message={error} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="gap-2 grid grid-cols-2">
            <FormField
              name="name"
              control={form.control}
              render={({ field }: any) => (
                <FormItem className="col-span-1">
                  <FormControl>
                    <Input {...field} placeholder="Full name..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }: any) => (
                <FormItem className="col-span-1">
                  <FormControl>
                    <Input {...field} placeholder="Email address..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="subject"
              control={form.control}
              render={({ field }: any) => (
                <FormItem className="col-span-2">
                  <FormControl>
                    <Input {...field} placeholder="Subject..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="concern"
              control={form.control}
              render={({ field }: any) => (
                <FormItem className="col-span-2">
                  <FormControl>
                    <Textarea {...field} placeholder="Concern..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2 relative">
              <Button className="w-full bg-prm" disabled={loading}>Send</Button>
              {
                loading && (
                  <Spinner
                    className="absolute top-1/2 left-4 -translate-y-2/4"
                    size="sm"
                    classNames={{
                      circle1: "border-b-white",
                      circle2: "border-b-white",
                    }}
                  />
                )
              }
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}