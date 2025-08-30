"use client"

import { Button } from "@/app/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Separator } from "@/app/components/ui/separator"
import { changeAccountPassword } from "@/lib/actions/account-actions/reset-user-password"
import { FormError } from "@/lib/ui/form-banners"
import { passwordChecker } from "@/lib/utils/password-checker"
import { AccountFormSchema } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export function ResetForm({ resetid, userid }: { resetid: string, userid: string }) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // errors 
  const [error, setError] = useState<string>('')

  const resetpassword = AccountFormSchema.omit({
    email: true,
    firstname: true,
    lastname: true,
  })

  const form = useForm<z.infer<typeof resetpassword>>({
    resolver: zodResolver(resetpassword),
    defaultValues: {
      password: '',
      confirm: '',
    }
  })

  async function onSubmit(values: z.infer<typeof resetpassword>) {

    // match passwords
    if (values.password !== values.confirm) {
      form.setError("password", {
        type: 'manual',
        message: "Password doesn't match!"
      })
      form.setError("confirm", {
        type: 'manual',
        message: "Password doesn't match!"
      })
      return
    }

    // check password strenght
    const { isMixed, hasNumbers, hasSymbols } = passwordChecker(values.password)

    if (!isMixed) {
      form.setError("password", {
        type: 'manual',
        message: "Password must contain UPPERCASE and lowercase letters!"
      })
      return
    } else if (!hasNumbers) {
      form.setError("password", {
        type: 'manual',
        message: "Password must contain numbers!"
      })
      return
    } else if (!hasSymbols) {
      form.setError("password", {
        type: 'manual',
        message: "Password must contain character symbols!"
      })
      return
    }

    setLoading(true)
    const response = await changeAccountPassword(resetid, userid, values.password)
    setLoading(false)

    if (response.status == 500) {
      setError("Server error!")
      message.error("An error occured, please try again later!")
      return
    }
    if (response.status == 403) {
      setError("Password cannot be the same!")
      message.error("Please don't use the same password!")
      return
    }

    sessionStorage.setItem("notice", JSON.stringify({
      "title": "Password Changed!",
      "description": "Account password successfully changed!"
    }))

    router.push("/signin")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full md:w-4/6">
        <h1 className="text-2xl font-bold text-center">Welcome to Antonio&apos;s Resort</h1>
        <h1 className=" text-center">Reset your account password!</h1>
        <br />
        <FormError message={error} />
        <FormField
          control={form.control}
          name="password"
          render={({ field }: any) => (
            <FormItem className="flex-grow">
              <FormLabel>Password: </FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Password" disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }: any) => (
            <FormItem className="flex-grow">
              <FormLabel>Confirm password:</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Confirm password" disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="w-max-contain text-xs md:text-sm opacity-70">A strong password must contain lowercase and UPPERCASE letters, numbers and character symbols.</p>
        <Separator className="my-4" />
        <Button
          type="submit"
          className="bg-prm w-full"
          disabled={loading}
        >{loading ? "Processing..." : "Change password"}</Button>
      </form>
    </Form>
  )
}