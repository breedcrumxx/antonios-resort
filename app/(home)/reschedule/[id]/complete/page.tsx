'use client'

import { Button } from "@/app/components/ui/button"
import { Result } from "antd";
import { useRouter } from "next/navigation";

export default function RescheduleCompletePage({ searchParams }: { searchParams: { data: string } }) {

  const router = useRouter()

  const data = Buffer.from(searchParams.data, 'base64').toString('utf-8')

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-muted/30">
      <div className="rounded-lg p-4 shadow bg-white">
        <Result
          status="success"
          title="Booking rescheduled!"
          subTitle={`Successfully rescheduled your booking, your new date is ${data}`}
          extra={[
            <Button className="bg-prm" onClick={() => router.push("/profile")} key="profile">Back to profile</Button>,
          ]}
        />
      </div>
    </div>
  )
}