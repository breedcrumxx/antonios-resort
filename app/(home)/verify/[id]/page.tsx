import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { headers } from "next/headers"
import Redirector from "./components/redirector"

export default async function VerifyPage(context: { params: { id: string } }) {

  try {
    const parsed = atob(context.params.id)
    const check = await prisma.user.update({
      where: {
        id: parsed
      },
      data: {
        verified: true
      }
    })

    if (!check.verified) throw new Error("Unable to verify the user's account.")

    return (
      <Redirector />
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting account verification.", "GET", "Fatal", "", "/verify")
    return (
      <div className="min-h-screen min-w-screen flex justify-center items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0012"
          subtitle="We are unable to verify you account right now, please try again later!"
          fatal
        />
      </div>
    )
  }
}