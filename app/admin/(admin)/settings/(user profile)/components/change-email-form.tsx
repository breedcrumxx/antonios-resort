'use client'

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/app/components/ui/input-otp";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useDevs } from "@/app/providers/dev-configuration-provider";
import { authenticateUser, checkEmailExistense } from "@/lib/actions/account-actions/change-email-process";
import { replaceEmail } from "@/lib/actions/account-actions/replace-email";
import { Spinner } from "@nextui-org/spinner";
import { message } from "antd";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangeEmailForm({ open, close, prevemail, className }: { open: boolean, close: () => void, prevemail: string, className?: string }) {

  const { dev } = useDevs()
  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [tab, setTab] = useState<string>("default")
  const [formError, setFormError] = useState<string>("")

  // values
  const [newEmail, setNewEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [otpInput, setOtpInput] = useState<string>("")

  const handleVerify = async (e: any) => {
    e.preventDefault()
    setFormError("")

    // block the attemp if the user reached it
    const item = sessionStorage.getItem("attempts")
    let attempts = 0

    if (item) {
      attempts = parseInt(item)
      if (attempts >= 3) {
        message.error("Max attempts reached, please try again later!")
        return
      }
    }

    if (password.length == 0) {
      setFormError("Please enter your password!")
      return
    }

    setLoading(true)
    const otp = new Date().getTime().toString().slice(-6)
    setCode(otp)

    const response = await authenticateUser(prevemail, password)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured while your account, please try again later!")
      return
    }
    if (response.status == 401) {
      setFormError("Email or password doesn't match!")

      if (item) {
        sessionStorage.setItem("attempts", (attempts + 1).toString())// add 1 to it
      } else {
        sessionStorage.setItem("attempts", "1")
      }
      return
    }

    setTab("email")

  }

  const handleVerifyEmail = async (e: any) => {
    e.preventDefault()
    setFormError("")

    if (password.length == 0) {
      setFormError("Please enter your password!")
      return
    }

    setLoading(true)
    const otp = new Date().getTime().toString().slice(-6)
    setCode(otp)

    const response = await checkEmailExistense(newEmail, otp)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured while your account, please try again later!")
      return
    }
    if (response.data) {
      message.error("Email already in use!")
      setFormError("Email already in use!")
      return
    }

    // Debug control line
    if (dev.DEBUG && dev.otp) {
      console.log(otp)
    }

    setTab("verify")

  }

  const handleOtpInput = async (e: string) => {
    setOtpInput(e)

    if (e.length != 6) return

    if (e.length == 6 && code != e) {
      setFormError("OTP doesn't match!")
      return
    }

    const response = await replaceEmail(newEmail, prevemail)
    if (response.status == 500) {
      message.error("An error occured while changing your email address, please try again later!")
      return
    }

    sessionStorage.setItem("notice", JSON.stringify({
      "title": "Email Successfully Changed",
      "description": "Your email has been successfully updated. For security reasons, you have been temporarily logged out. Please log in again with your new email address."
    }))
    close()
    message.success("Changed successfully!")
    await signOut()
  }

  return (
    <Dialog open={open} onOpenChange={(e) => {
      close()
      router.refresh()
    }}>
      <Tabs value={tab}>
        <TabsContent value="default">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify It&apos;s You</DialogTitle>
              <DialogDescription>Please enter your password to verify it is you.</DialogDescription>
            </DialogHeader>

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
          </DialogContent>
        </TabsContent>
        <TabsContent value="email">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter New Email</DialogTitle>
              <DialogDescription>Please ensure that your email is active.</DialogDescription>
            </DialogHeader>

            <div>
              <form onSubmit={handleVerifyEmail} className="space-y-2">
                <div className="relative">
                  <Input placeholder="new email..." type="email" onChange={(e) => setNewEmail(e.target.value)} disabled={loading} />
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
                  <Button className={className} disabled={loading}>Change email</Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </TabsContent>
        <TabsContent value="verify">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify With OTP</DialogTitle>
              <DialogDescription>Please check your email for the One-Time-Password.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <div>
                <InputOTP maxLength={6} value={otpInput} onChange={(e) => handleOtpInput(e)}>
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
                {
                  formError.length > 0 && (
                    <p className="text-xs text-red-500">{formError}</p>
                  )
                }
              </div>
            </div>
            <br />
            <p className="text-sm">Please check your new email for verification code to ensure your new email address is active and can receive emails.</p>
          </DialogContent>
        </TabsContent>
      </Tabs>
    </Dialog>
  )
}