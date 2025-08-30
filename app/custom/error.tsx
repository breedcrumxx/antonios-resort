'use client'

import { Result } from "antd"
import { Button } from "../components/ui/button"
import { useRouter } from "next/navigation"

export default function ErrorPage() {
  const router = useRouter()

  router.prefetch("/")

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        status="500"
        title="500"
        subTitle="We encountered an error while processing your request, please try again later."
        extra={[
          <Button key={'report-btn'} variant={"ghost"}>Report the problem</Button>,
          <Button key={'home'} className="bg-prm" onClick={() => router.push("/")}>Back Home</Button>,
        ]}
      />
    </div>
  )
}