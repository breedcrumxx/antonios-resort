'use client'

import { Button } from "@/app/components/ui/button";
import { Result } from "antd";
import { useRouter } from "next/navigation";

export default function SuccessPage({ params }: { params: { status: string[] } }) {

  const router = useRouter()

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        status="success"
        title={`Successfully ${params.status[0]} a package!`}
        subTitle={`Successsfully ${params.status[0]} a package, and is now active.`}
        extra={[
          <Button
            variant="outline"
            onClick={() => router.push("/custom")}
            key={0}>Create another</Button>,
          <Button
            className="bg-prm"
            onClick={() => router.push("/package")}
            key={1}>
            Back to offers page
          </Button>,
        ]}
      />
    </div>
  )
}