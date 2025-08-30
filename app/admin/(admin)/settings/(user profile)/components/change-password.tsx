'use client'

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { changePassword } from "@/lib/actions/account-actions/change-password";
import { authenticateUser } from "@/lib/actions/account-actions/change-email-process";
import { FormError } from "@/lib/ui/form-banners";
import { passwordChecker } from "@/lib/utils/password-checker";
import { AccountLoginFormSchema } from "@/lib/zod/z-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@nextui-org/spinner";
import { message } from "antd";
import { Eye } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from 'zod';

const ChangePassword = z.object({
  confirm: z.string()
}).merge(AccountLoginFormSchema)

export default function ChangePasswordForm({ open, close, email, className }: { open: boolean, close: () => void, email: string, className?: string }) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [tab, setTab] = useState<string>("default")
  const [formError, setFormError] = useState<string>("")
  const [showPassword, setShowPassword] = useState<{
    pass1: string,
    pass2: string,
  }>({
    pass1: "password",
    pass2: "password"
  })

  // values
  const [password, setPassword] = useState<string>("")

  const form = useForm<z.infer<typeof ChangePassword>>({
    resolver: zodResolver(ChangePassword),
    defaultValues: {
      email: email,
      password: "",
      confirm: "",
    }
  })

  const handleVerify = async (e: any) => {
    e.preventDefault()
    setFormError("")

    if (password.length == 0) {
      setFormError("Please enter your password!")
      return
    }

    setLoading(true)

    const response = await authenticateUser(email, password)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured while authenticating, please try again later!")
      return
    } else if (response.status == 404) {
      message.error("Your data went missing!")
      return
    } else if (response.status == 401) {
      message.error("Password doesn't match!")
      setFormError("Incorrect password!")
      return
    }

    setTab("change")
  }

  async function onSubmit(values: z.infer<typeof ChangePassword>) {
    setFormError("")

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

    if (values.confirm != values.password) {
      setFormError("Password doesn't match!")
      return
    }

    setLoading(true)

    const response = await changePassword(values.email, values.password)
    setLoading(false)
    if (response.status == 500) {
      message.error("Unable to change the password, please try again later!")
      setFormError("Server error!")
      return
    }
    if (response.status == 404) {
      message.error("Unable to change the password, please try again later!")
      setFormError("Data went missing!")
      return
    }
    if (response.status == 202) {
      setFormError("No changes made!")
      return
    }

    sessionStorage.setItem("notice", JSON.stringify({
      "title": "Password Successfully Changed",
      "description": "Your password has been successfully updated. For security reasons, you have been temporarily logged out. Please log in again."
    }))

    await signOut()
  }

  return (
    <Dialog open={open} onOpenChange={(e) => {
      close()
      router.refresh()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>We need to make sure it&apos;s you before making any changes.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab}>
          <TabsContent value="default">
            <div>
              <form onSubmit={handleVerify} className="space-y-2">
                <div className="relative">
                  <Input placeholder="password..." type="password" onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                  {
                    loading && (
                      <Spinner size="sm" className="absolute top-1/2 right-5 -translate-y-2/4" />
                    )
                  }
                </div>
                {
                  formError.length > 0 && (
                    <p className="text-xs text-red-500">{formError}</p>
                  )
                }
                <div className="flex justify-end space-y-2">
                  <Button className={className} disabled={loading}>Verify</Button>
                </div>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="change">
            <div className="space-y-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
                  <FormError message={formError} />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" {...field} placeholder="Email" readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: any) => (
                      <FormItem className="relative">
                        <FormControl>
                          <Input type={showPassword.pass1} {...field} placeholder="New password" disabled={loading} />
                        </FormControl>
                        <Eye className="absolute right-2 top-0 w-6 h-6 opacity-70 cursor-pointer" onMouseDown={(e) => setShowPassword({ ...showPassword, pass1: "text" })}
                          onMouseUp={(e) => setShowPassword({ ...showPassword, pass1: "password" })}
                          onTouchStart={(e) => setShowPassword({ ...showPassword, pass1: "text" })}
                          onTouchEnd={(e) => setShowPassword({ ...showPassword, pass1: "password" })}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }: any) => (
                      <FormItem className="relative">
                        <FormControl>
                          <Input type={showPassword.pass2} {...field} placeholder="Confirm password" disabled={loading} />
                        </FormControl>
                        <Eye className="absolute right-2 top-0 w-6 h-6 opacity-70 cursor-pointer" onMouseDown={(e) => setShowPassword({ ...showPassword, pass2: "text" })}
                          onMouseUp={(e) => setShowPassword({ ...showPassword, pass2: "password" })}
                          onTouchStart={(e) => setShowPassword({ ...showPassword, pass2: "text" })}
                          onTouchEnd={(e) => setShowPassword({ ...showPassword, pass2: "password" })}
                        />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button className={className} type="submit" disabled={loading}>Change password</Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}