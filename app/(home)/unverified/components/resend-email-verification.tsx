'use client'

import { Button } from "@/app/components/ui/button"
import { verifyAccountEmail } from "@/lib/actions/account-actions/send-account-verification"
import { message } from "antd"
import { add } from "date-fns"
import { useEffect, useState } from "react"

export default function ResendEmailVerification({ email }: { email: string }) {

  // states
  const [cooldown, setCooldown] = useState<number>(0)


  useEffect(() => {
    const resend = localStorage.getItem("resend")
    if (resend) {
      const diff = parseInt(resend) - new Date().getTime()

      if (diff > 0) {
        setCooldown(diff)
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (cooldown > 0) {
      interval = setInterval(() => {
        if (cooldown <= 0) {
          clearInterval(interval);
          setCooldown(0);
        } else {
          setCooldown((prev) => prev - 1000);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [cooldown])


  const resendEmail = async () => {
    const resendcooldown = add(new Date(), { minutes: 5 }).getTime() - new Date().getTime()
    localStorage.setItem('resend', add(new Date(), { minutes: 5 }).getTime().toString())
    setCooldown(resendcooldown)
    verifyAccountEmail(email)
    message.success("Email verification sent!")
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <Button
        className="bg-prm"
        onClick={() => resendEmail()}
        disabled={cooldown > 0}>{cooldown > 0 && `${formatTime(cooldown)}`} Resend email</Button>
    </>
  )
}