'use client'

import { Result } from "antd";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlockedNotice() {

  const router = useRouter()

  return (
    <div className="min-w-scree min-h-screen flex justify-center items-center">
      <Result
        status="error"
        title="Action Required: Account Blocked"
        subTitle={
          <>
            <p className="text-sm text-gray-500">Your account has been blocked by the admin, preventing further actions. </p>
            <p className="text-sm text-gray-500">If you believe this is a mistake, please contact our support team to request an unblocking.</p>
          </>
        }
        extra={[
          <Button key="buy" className="bg-prm" onClick={() => router.replace('/signin')}>Back to sign-in</Button>,
        ]}
      >
        <div className="desc">
          <p className="font-semibold text-xl">
            Following reasons:
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Your account has been frozen
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Repeated No-Shows
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Fraudulent Activity
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Violation of Terms of Service
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Spamming or Misuse
          </p>
          <p className="font-semibold flex gap-2 items-center text-md">
            <X className="w-4 h-4 text-red-500" />
            Payment Issues
          </p>
        </div>
      </Result>
    </div>
  )
}