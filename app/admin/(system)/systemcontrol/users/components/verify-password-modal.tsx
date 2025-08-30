'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useToast } from "@/app/components/ui/use-toast"
import { authenticateUser } from "@/lib/actions/account-actions/change-email-process"
import { FormError } from "@/lib/ui/form-banners"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/spinner"
import clsx from "clsx"
import { add } from "date-fns"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod';

const VerifyPassword = z.object({
  password: z.string()
    .min(1, { message: "Please enter your password!" })
    .min(8, { message: "Please enter a valid password!" })
    .max(32, { message: "Maximum of 32 characters!" }),
})

export default function VerifyPasswordModal({
  open,
  close,
  setAllow,
  email,
  className
}: {
  open: boolean,
  close: () => void,
  setAllow: (value: boolean) => void
  email: string,
  className?: string
}) {

  const { toast } = useToast()
  const ref = useRef<HTMLFormElement>(null)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [formError, setFormError] = useState<string>("")

  const form = useForm<z.infer<typeof VerifyPassword>>({
    resolver: zodResolver(VerifyPassword),
    defaultValues: {
      password: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof VerifyPassword>) => {
    setFormError("")

    // read the attempts and prevent if theres active cooldown
    const stringAttempts = sessionStorage.getItem("attempts")
    if (stringAttempts) {
      let { count, expires } = JSON.parse(stringAttempts)

      if (expires && expires >= new Date().getTime()) {
        setFormError("Max attempts reached, please try again later!")
        return
      } else { // clear the cooldown
        sessionStorage.removeItem("attempts")
      }
    }

    setLoading(true)

    const response = await authenticateUser(email, values.password)
    setLoading(false)

    if (response.status == 401) {
      setFormError("Wrong password!")


      if (stringAttempts) { // has attempts
        let { count, expires } = JSON.parse(stringAttempts)
        count = count + 1// add 1 to the attemp

        if (count >= 3) { // set a 2 mins cooldown
          const timestamp = new Date(add(new Date(), { minutes: 2 })).getTime()
          expires = timestamp
        }

        sessionStorage.setItem("attempts", JSON.stringify({ count, expires }))

      } else { // no previous attempts
        const attempts = { count: 1, expires: null }
        sessionStorage.setItem("attempts", JSON.stringify(attempts))
      }

      return
    } else if (response.status == 404) {
      setFormError("Account credentials cannot be found!")
      toast({
        title: "Something went missing!",
        description: "Account credentials cannot be found!"
      })
      return
    } else if (response.status == 500) {
      setFormError("Internal server error!")
      toast({
        title: "An error occured!",
        description: "Internal server error, please try again later!"
      })
    }

    // clear the attempts
    sessionStorage.removeItem("attempts")

    setAllow(true)
    close()
  }

  return (
    <Dialog open={open} onOpenChange={() => close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Its You!</DialogTitle>
          <DialogDescription>We need to make sure it is you before making any changes.</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form ref={ref} onSubmit={form.handleSubmit(onSubmit)}>
              <FormError message={formError} />
              <FormField
                name="password"
                control={form.control}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="password..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <div className="relative">
            {
              loading && (
                <Spinner size="sm"
                  classNames={{
                    circle1: "border-b-white",
                    circle2: "border-b-white",
                  }}
                  className="absolute left-4 top-1/2 -translate-y-2/4 z-10" />
              )
            }
            <Button className="w-[150px]" onClick={() => {
              ref.current?.requestSubmit()
            }} disabled={true}>Verify</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}