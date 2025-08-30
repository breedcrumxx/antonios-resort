'use client'

import { Button } from "@/app/components/ui/button"
import { Result } from "antd"
import { useRouter } from "next/navigation"

export default function Redirector() {

  const router = useRouter()

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
      <Result
        status="success"
        title="Your account has been verified!"
        subTitle="Successfully verified your account, you are now able to access Antonio's Resort features and services."
        extra={[
          <Button className="bg-prm" key="buy" onClick={() => router.push('/signin')}>Sign-in</Button>,
        ]}
      />
    </div>
  )
}