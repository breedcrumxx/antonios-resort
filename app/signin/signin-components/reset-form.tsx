'use client'

import { useSimpleNotification } from "@/app/components/custom/simple-notification"
import SimpleStep from "@/app/components/custom/simple-step"
import SimpleTabs, { SimpleTab } from "@/app/components/custom/simple-tab"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/app/components/ui/input-otp"
import { Separator } from "@/app/components/ui/separator"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { changeAccountPassword, sendUserResetOTP } from "@/lib/actions/account-actions/reset-user-password"
import { FormError } from "@/lib/ui/form-banners"
import { passwordChecker } from "@/lib/utils/password-checker"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useRef, useState } from 'react'
import { useForm } from "react-hook-form"
import z from 'zod'

export default function ResetPasswordForm() {

  const router = useRouter()
  const otpFormRef = useRef(null)
  const passwordFormRef = useRef(null)
  const { dev } = useDevs()
  const { simpleNotification } = useSimpleNotification()

  // states
  const [pos, setPos] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("resetlink")

  // values
  const [matchOTP, setMatchOTP] = useState<string>("")

  const ResetFormType = z.object({
    email: z.string()
      .email({ message: "Please enter a valid email!" })
      .min(1, { message: "Please enter your account email!" }),
  })
  const OTPFormType = z.object({
    otp: z.string()
      .min(1, { message: "Please enter your OTP!" })
      .min(6, { message: "Please enter your full OTP!" })
  })
  const ResetPasswordFormType = z.object({
    password: z.string()
      .min(1, { message: "Please enter your new password!" })
      .min(8, { message: "Password must at least be 8 charaters long!" })
      .max(32, { message: "Maximum of 32 characters only!" }),
    confirm: z.string()
      .min(1, { message: "Please confirm your new password!" })
      .min(8, { message: "Password must at least be 8 charaters long!" })
      .max(32, { message: "Maximum of 32 characters only!" }),
  })

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [counter, setCounter] = useState<number>(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()

  const emailForm = useForm<z.infer<typeof ResetFormType>>({
    resolver: zodResolver(ResetFormType),
    defaultValues: {
      email: "",
    }
  })
  const OTPForm = useForm<z.infer<typeof OTPFormType>>({
    resolver: zodResolver(OTPFormType),
    defaultValues: {
      otp: "",
    }
  })
  const resetPasswordForm = useForm<z.infer<typeof ResetPasswordFormType>>({
    resolver: zodResolver(ResetPasswordFormType),
    defaultValues: {
      password: "",
      confirm: "",
    }
  })

  const initCooldown = () => {
    // start the countdown
    setIntervalId(setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) { // Stop the interval when the counter reaches 0
          clearInterval(intervalId)
          return 0;
        }
        return prev - 1;
      });
    }, 1000))
  }

  async function onEmailSubmit(values: z.infer<typeof ResetFormType>) {
    setError("")

    // generate an otp base on time
    const newotp = new Date().getTime().toString().slice(-6)

    // TODO: dont forget to add the otp console
    if (dev.DEBUG) {
      console.log(newotp)
    }

    setMatchOTP(newotp) // set the otp to match

    setLoading(true)
    const response = await sendUserResetOTP(values.email, newotp) // send the otp to the user's email
    setLoading(false)

    if (response.status == 500) {
      setError("Server error!")
      message.error("An error occured, please try again later!")
      return
    }
    if (response.status == 404) {
      message.error("Account doesn't exist!")
      setError("Account doesn't exist!")
      return
    }

    simpleNotification({ message: "OTP sent, please check your email!", status: "success" })
    setPos((prev) => 1)
    setActiveTab("setotp")

    setCounter((prev) => 120) // initialize the counter to 120 seconds

    // clear any interval that exist
    clearInterval(intervalId)

    initCooldown()
  }

  const verifyOTP = (values: z.infer<typeof OTPFormType>) => {
    if (values.otp != matchOTP) {
      simpleNotification({ message: "OTP not matched!", status: "error" })
      return
    }
    simpleNotification({ message: "OTP verified!", status: "success" })
    setPos((prev) => prev + 1)
    setActiveTab("changepassword")
  }

  const onResetPassword = async (values: z.infer<typeof ResetPasswordFormType>) => {
    setError("")

    if (values.password != values.confirm) {
      resetPasswordForm.setError("password", { message: "Password doesn't match!" })
      return
    }

    const result = passwordChecker(values.password)

    if (result.length > 0) {
      resetPasswordForm.setError("password", { message: result })
      return
    }

    setLoading(true)
    const response = await changeAccountPassword(emailForm.getValues('email'), values.password)

    if (response.status == 500) {
      setLoading(false)
      setError("Internal server error!")
      return
    }
    if (response.status == 404) {
      setLoading(false)
      setError("Account cannot be found!")
      return
    }
    if (response.status == 409) {
      setLoading(false)
      setError("Password was used previously!")
      return
    }

    // message here
    simpleNotification({ message: "Password updated successfully!", status: "success" })
    router.push('/signin') // go back to signin page
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center">Welcome to Antonio&apos;s Resort</h1>
      <h1 className=" text-center">Reset your account password!</h1>
      <br />
      <SimpleTabs active={activeTab}>
        <SimpleTab
          name="resetlink"
          className="w-full px-8"
        >
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-2">
              <FormError message={error} />
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }: any) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" {...field} placeholder="Email..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full relative">
                <Button className="w-full bg-prm" disabled={loading || emailForm.getValues("email").length == 0}>Send reset link</Button>
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
              <p className="text-sm opacity-70">We will send an email with a link to reset your password.</p>
            </form>
          </Form>
        </SimpleTab>
        <SimpleTab
          name="setotp"
          className="w-full px-8"
        >
          <Form {...OTPForm}>
            <form ref={otpFormRef} onSubmit={OTPForm.handleSubmit(verifyOTP)}>
              <h1 className="text-center font-semibold">Enter your One-Time-Password</h1>
              <br />
              <FormField
                name="otp"
                control={OTPForm.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="w-full flex flex-col gap-2 items-center">
                      <FormControl>
                        <InputOTP onChange={(e) => {
                          field.onChange(e)
                          if (e.length > 5) {
                            (otpFormRef?.current as unknown as HTMLFormElement).requestSubmit()
                            return
                          }
                        }} maxLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                    </div>
                    <FormMessage />
                    <FormDescription>Please check your email for the one-time-password.</FormDescription>
                  </FormItem>
                )}
              />

              <div className="w-full relative mt-2">
                <Button
                  className="w-full bg-prm"
                  disabled={counter > 0 || loading}
                  onClick={(e) => {
                    e.preventDefault()
                    onEmailSubmit(emailForm.getValues())
                  }}>
                  Resend OTP ({Math.floor(counter / 60)}:{(counter % 60).toString().padStart(2, '0')})
                </Button>
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
        </SimpleTab>
        <SimpleTab
          name="changepassword"
          className="w-full px-8">
          <Form {...resetPasswordForm}>
            <form ref={passwordFormRef} onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-2 w-full">
              <h1 className="text-center font-semibold">Last step, Update your password!</h1>
              <FormError message={error} />
              <br />
              <FormField
                name="password"
                control={resetPasswordForm.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="confirm"
                control={resetPasswordForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-4" />

              <p className="w-max-contain text-xs md:text-sm opacity-70">A strong password must contain lowercase and UPPERCASE letters, numbers and character symbols.</p>

              <div className="w-full mt-2">
                <Button className="w-full bg-prm">Change password</Button>
              </div>
            </form>
          </Form>
        </SimpleTab>
      </SimpleTabs>

      <div className="flex-grow"></div>
      <SimpleStep pos={pos} stepCount={3} />
    </>
  )
}