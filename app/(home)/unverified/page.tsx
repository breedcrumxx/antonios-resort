import { Button } from "@/app/components/ui/button"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { Result } from "antd"
import { headers } from "next/headers"
import ResendEmailVerification from "./components/resend-email-verification"

export default async function Unverified({ searchParams }: { searchParams: { data?: string } }) {

  try {

    if (!searchParams.data) throw new Error("No data provided!")
    const parsed = atob(searchParams.data)

    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <Result
          status="warning"
          title="Unverified account!"
          subTitle="Your account hasn't been verified. If you have not received an email, we can resend you a new one."
          extra={<ResendEmailVerification email={parsed} />}
        />
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting unverified page.", "GET", "Minor", "", "/unverified")
    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0011"
          subtitle="We are unable to get this page, please try again later!"
        />
      </div>
    )
  }


}