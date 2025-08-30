"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { signup } from "@/lib/actions/account-actions/signup"
import { FormError } from "@/lib/ui/form-banners"
import { validateEmail } from "@/lib/utils/email-validator"
import { passwordChecker } from "@/lib/utils/password-checker"
import { AccountFormSchema } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "@/app/components/ui/separator"
import { useSession } from "next-auth/react"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Spinner } from "@nextui-org/spinner"
import PolicyContainer from "@/lib/utils/policy-container"

export function ClientSignUpForm() {

  const { status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [termsAccept, setTermsAccept] = useState<boolean>(false)
  const [privacyAccept, setPrivacyAccept] = useState<boolean>(false)
  const [openPrivacy, setOpenPrivacy] = useState<boolean>(false)
  const [openTerms, setOpenTerms] = useState<boolean>(false)

  // errors 
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (status == "authenticated") {
      router.push('/')
    }
  }, [status])

  const form = useForm<z.infer<typeof AccountFormSchema>>({
    resolver: zodResolver(AccountFormSchema),
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      password: '',
      confirm: '',
    }
  })

  async function onSubmit(values: z.infer<typeof AccountFormSchema>) {

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

    // check valid emails
    const isValid = validateEmail(values.email)

    if (!isValid) {
      form.setError("email", { message: "This email is currently not supported!" })
      return
    }

    // check password strenght
    const result = passwordChecker(values.password)

    if (result.length > 0) {
      form.setError("password", {
        type: 'manual',
        message: result
      })
      return
    }

    setLoading(true)
    const response = await signup(values)

    if (response.status == 201) {
      // redirect to signIn
      const callback = searchParams.get('callbackUrl')

      sessionStorage.setItem("notice", JSON.stringify({
        "title": "Verify account!",
        "description": "We've sent you an email containing a link to verify your AR account."
      }))

      if (callback != null) {
        router.push('/signin?callbackUrl=' + callback)
      } else {
        router.push('/signin?callbackUrl=/')
      }
    } else if (response.status == 422) {
      setError("There's a problem with your request!")
    } else if (response.status == 409) {
      form.setError("email", {
        message: "This email is already taken!"
      })
    } else {
      setError("There's a server problem!")
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full md:w-4/6">
        <h1 className="text-2xl font-bold text-center">Welcome to Antonio&apos;s Resort</h1>
        <h1 className=" text-center">Sign-up now and start your new booking!</h1>
        <br />
        <FormError message={error} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Email: </FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Email" disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:flex md:gap-5">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }: any) => (
              <FormItem className="flex-grow">
                <FormLabel>First name: </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="First name" disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }: any) => (
              <FormItem className="flex-grow">
                <FormLabel>Last name: </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Last name" disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:flex md:gap-5">
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
                <FormLabel>Confirm password: </FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm password" disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="w-max-contain text-xs md:text-sm opacity-70">A strong password must contain lowercase and UPPERCASE letters, numbers and character symbols.</p>
        <Separator className="my-4" />

        <div className="flex px-4 items-center space-x-2">
          <Checkbox id="terms" checked={termsAccept} onCheckedChange={(e) => {
            if (!termsAccept) { // at click, open the privacy modal
              setOpenTerms(true)
              return
            }
            setTermsAccept(e as boolean) // when it's true, remove the check
          }} />
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the <PolicyContainer
              content="termscondition"
              title="Terms and conditions"
              className="text-prm underline cursor-pointer"
              setAccept={(value: boolean) => setTermsAccept(value)}
              interactive={openTerms}
              setInteractive={(value: boolean) => setOpenTerms(value)}
              singlemode
            /> of Antonio&apos;s Resort.
          </label>
        </div>

        <div className="flex px-4 items-center space-x-2">
          <Checkbox id="terms" checked={privacyAccept} onCheckedChange={(e) => {
            if (!privacyAccept) { // at click, open the privacy modal
              setOpenPrivacy(true)
              return
            }
            setPrivacyAccept(e as boolean) // when it's true, remove the check
          }} />
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the <PolicyContainer
              content="privacypolicy"
              title="Privacy & cookie policy"
              className="text-prm underline cursor-pointer"
              setAccept={(value: boolean) => setPrivacyAccept(value)}
              interactive={openPrivacy}
              setInteractive={(value: boolean) => setOpenPrivacy(value)}
              singlemode
            /> of Antonio&apos;s Resort.
          </label>
        </div>

        <div className="w-full relative">
          <Button type="submit" className="bg-prm w-full" disabled={loading || !termsAccept || !privacyAccept}>Sign-up</Button>
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
  )
}