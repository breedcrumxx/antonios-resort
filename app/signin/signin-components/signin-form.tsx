'use client'

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { checkAccountAcceptedPolices, updateAccountAcceptedPolicies } from "@/lib/actions/account-actions/account-policy-update"
import { createUserLog } from "@/lib/actions/account-actions/create-user-log"
import { FormError } from "@/lib/ui/form-banners"
import PolicyContainer from "@/lib/utils/policy-container"
import { AccountLoginFormSchema } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/spinner"
import { Separator } from "@radix-ui/react-separator"
import clsx from "clsx"
import { Eye } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "../../components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../components/ui/form"

export default function ClientSignInForm() {

  const router = useRouter()
  const { data: session, status } = useSession()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<string>("password")
  const [prevAccount, setPrevAccount] = useState<string>("")
  const [openPrivacy, setOpenPrivacy] = useState<boolean>(false)
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const [unaccepetedPolicies, setUnAcceptedPolicies] = useState<{ name: string, accept: boolean }[]>([])

  // errors 
  const [formError, setFormError] = useState<string>('')
  const [notice, setNotice] = useState<ModalError>({ title: "", description: "" })

  useEffect(() => { // read any previous error
    const notice = sessionStorage.getItem("notice")

    if (notice) {
      setNotice(JSON.parse(notice))
      sessionStorage.removeItem("notice")
    }

    if (status == "authenticated" && session) {
      const user = session.user as UserSession

      if (user.role.businesscontrol) {
        router.push('/admin')
        return
      }
      if (user.role.utilityaccess) {
        router.push('/scan')
        return
      }
      if (user.role.systemcontrol) {
        router.push('/admin/systemcontrol')
        return
      }

      router.push('/package')
    }
  }, [status, session])

  const form = useForm<z.infer<typeof AccountLoginFormSchema>>({
    resolver: zodResolver(AccountLoginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: z.infer<typeof AccountLoginFormSchema>) {
    setFormError('')
    setLoading(true)

    const validatedFields = AccountLoginFormSchema.safeParse(values)

    if (!validatedFields.success) {
      setLoading(false)
      return
    }

    const { email, password } = validatedFields.data

    //check attepts
    const attempts = sessionStorage.getItem('login')

    // check the attempts
    if (attempts) {
      const { attempt, expires } = JSON.parse(attempts)
      const timenow = new Date().getTime()

      // check if it is expired
      if (timenow < expires && attempt == 3) {
        setFormError('Max attempts reach, please try again later.')
        return
      }

      sessionStorage.removeItem('login')
    }

    // check for accounts policies if unacceptedpolicies array is emptry
    if (prevAccount != values.email) { // if the account is not the same of previous, check for policy updates
      const policyblockresponse = await checkAccountAcceptedPolices(email, password)

      if (policyblockresponse.status == 500) {
        setLoading(false)
        setFormError("Server error!")
        return
      }
      if (policyblockresponse.status == 404) { // account doesnt exist
        setLoading(false)
        setFormError('Invalid username or password!')
        return
      }
      if (policyblockresponse.status == 403) { // account doesnt exist
        setPrevAccount(values.email)
        setLoading(false)
        setFormError('Ensure to read and check the policies!')
        setUnAcceptedPolicies(policyblockresponse.data.map((item) => ({ name: item, accept: false })))
        return
      }
    } // if it's equal, meaning it's the same from my previous prompts, and is same to update


    // if there's unaccepted policies, update the user account to accepted the latest
    if (unaccepetedPolicies.length > 0) {
      const response = await updateAccountAcceptedPolicies(email, unaccepetedPolicies)
      if (response.status == 500) {
        setLoading(false)
        setFormError("Server error!")
        return
      }
    }

    const response = await signIn('login', { email, password, redirect: false })

    if (!response) {
      setLoading(false)
      setFormError("Unknown error occured!")
      return
    }

    if (response.error?.startsWith("/")) {
      router.push(response.error)
      return
    }

    if (response.status == 500) {
      setLoading(false)
      setFormError("Server error!")
      return
    }
    if (response.error == "404") { // account doesnt exist
      setLoading(false)
      setFormError('Invalid username or password!')
      return
    }
    if (response.error == "422") { // incorrect password
      setLoading(false)
      setFormError('Invalid username or password!')
      if (attempts) {
        let setExpire = 0
        const { attempt, expires } = JSON.parse(attempts)
        const incremented = attempt + 1

        if (incremented == 3) {
          const expireTreshold = new Date().setMinutes(new Date().getMinutes() + 5)
          setExpire = expireTreshold
        }

        sessionStorage.setItem('login', JSON.stringify({ attempt: incremented, expires: setExpire }))

      } else { // no recent attempts
        const record = { attempt: 1, expires: null }
        sessionStorage.setItem('login', JSON.stringify(record))
      }
      return
    }
    if (response.error == null) { // successful login
      sessionStorage.removeItem('login')
      await createUserLog("User logged-in.")
    }

  }

  const isDisabled = () => {
    if (loading) return true
    if (unaccepetedPolicies.length > 0 && unaccepetedPolicies.some((item) => !item.accept)) return true
    return false
  }

  return (
    <>
      <Form {...form}>
        <form action="" onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-3/6 space-y-2">
          <h1 className="text-3xl font-bold text-center elegant">Welcome to Antonio&apos;s Resort</h1>
          <h1 className=" text-center">Sign-in now and start your new booking!</h1>
          <br />
          <FormError message={formError} />
          <FormField
            control={form.control}
            name="email"
            render={({ field }: any) => (
              <FormItem>
                <FormControl>
                  <Input type="email" {...field} placeholder="Email" disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: any) => (
              <FormItem className="relative">
                <FormControl>
                  <Input type={showPassword} {...field} placeholder="Password" disabled={loading} />
                </FormControl>
                <Eye className={clsx("absolute right-2 top-0 w-6 h-6 opacity-70 cursor-pointer text-prm", {
                  "pointer-events-none": loading
                })}
                  onMouseDown={(e) => setShowPassword("text")}
                  onMouseUp={(e) => setShowPassword("password")}
                  onMouseLeave={(e) => setShowPassword("password")}
                  onTouchStart={(e) => setShowPassword("text")}
                  onTouchEnd={(e) => setShowPassword("password")}
                />
              </FormItem>
            )}
          />
          <Separator />

          {
            unaccepetedPolicies.some((x) => x.name === "termscondition") && (
              <div className="flex px-4 items-center space-x-2">
                <Checkbox id="terms" checked={unaccepetedPolicies.find(x => x.name == "termscondition")?.accept} onCheckedChange={(e) => {
                  if (!unaccepetedPolicies.find(x => x.name == "termscondition")?.accept) { // at click, open the privacy modal
                    setOpenTerms(true)
                    return
                  }
                  setUnAcceptedPolicies(prev => prev.map((y) => y.name == "termscondition" ? ({ ...y, accept: false }) : y)) // when it's true, remove the check
                }} />
                <label
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the <PolicyContainer
                    content="termscondition"
                    title="Terms and conditions"
                    className="text-prm underline cursor-pointer"
                    setAccept={(value: boolean) => setUnAcceptedPolicies(prev => prev.map((y) => y.name == "termscondition" ? ({ ...y, accept: value }) : y))}
                    interactive={openTerms}
                    setInteractive={(value: boolean) => setOpenTerms(value)}
                    singlemode
                  />.
                </label>
              </div>
            )
          }

          {
            unaccepetedPolicies.some((x) => x.name === "privacypolicy") && (
              <div className="flex px-4 items-center space-x-2">
                <Checkbox id="privacy" checked={unaccepetedPolicies.find(x => x.name == "privacypolicy")?.accept} onCheckedChange={(e) => {
                  if (!unaccepetedPolicies.find(x => x.name == "privacypolicy")?.accept) { // at click, open the privacy modal
                    setOpenPrivacy(true)
                    return
                  }
                  setUnAcceptedPolicies(prev => prev.map((y) => y.name == "privacypolicy" ? ({ ...y, accept: false }) : y)) // when it's true, remove the check
                }} />
                <label
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the <PolicyContainer
                    content="privacypolicy"
                    title="Privacy & cookie policy"
                    className="text-prm underline cursor-pointer"
                    setAccept={(value: boolean) => setUnAcceptedPolicies(prev => prev.map((y) => y.name == "privacypolicy" ? ({ ...y, accept: value }) : y))}
                    interactive={openPrivacy}
                    setInteractive={(value: boolean) => setOpenPrivacy(value)}
                    singlemode
                  />.
                </label>
              </div>
            )
          }

          <div className="w-full relative">
            <Button className="w-full bg-prm" type="submit" disabled={isDisabled()}>Sign in</Button>
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
          <div className="text-right text-xs text-prm">
            <Link
              href="/signin/reset"
              prefetch
            >forgot password?</Link>
          </div>
        </form>
      </Form>
      <Dialog open={notice.title.length > 0} onOpenChange={(e) => setNotice({ title: "", description: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-prm" onClick={() => setNotice({ title: "", description: "" })}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}