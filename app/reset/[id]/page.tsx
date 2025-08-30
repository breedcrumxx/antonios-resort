'use server'

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import AuthSlider from "../../admin/components/auth-slider"
import RedirectButton from "./components/redirect-button"
import { ResetForm } from "./components/reset-form"

export default async function ResetPasswordPage({ params }: { params: { id: string } }) {

  try {
    const data = await prisma.resetpasswordlink.findUnique({
      where: {
        id: params.id
      }
    })

    if (!data) throw Error("404")
    if (data.used) throw Error("403")

    if (new Date(data.validuntil).getTime() < new Date().getTime()) {
      return (
        <div className="min-w-screen min-h-screen flex justify-center items-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500 flex gap-2 items-center"><ExclamationTriangleIcon className="h-6 w-6" />Reset link unavailable</CardTitle>
              <CardDescription>The reset link had already expired, please request a new one and try again!</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
              <RedirectButton href="/">
                Back to home
              </RedirectButton>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return (
      <div className="w-screen h-screen sm:flex relative">
        <div className="sm:w-full md:w-1/2 sm:min-h-screen h-full bg-prm">
          <AuthSlider />
        </div>
        <Card className="absolute m-auto inset-0 w-5/6 h-max flex flex-col items-center justify-center p-5 space-y-2 md:relative md:h-full sm:w-1/2 md:border:none">
          <div className="hidden md:block md:flex-grow"></div>
          <ResetForm
            resetid={data.id}
            userid={data.userid}
          />
          <div className="hidden md:block md:flex-grow"></div>
          <br className="block md:hidden" />
          <p className="text-sm">Don&apos;t have an account yet? <Link href="/signup" className="text-prm cursor-pointer underline">Sign up</Link></p>
        </Card>
      </div>
    )

  } catch (error) {
    if (error instanceof Error && (error.message == "403" || error.message == "404")) {
      redirect("/" + error.message)
    }

    await systemLogger(error, Object.fromEntries(headers()), "Requesting reset password page.", "GET", "Moderate", "", "/reset")

    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0017"
          subtitle="An error occured, please try again later!"
          fatal
        />
      </div>
    )
  }

}