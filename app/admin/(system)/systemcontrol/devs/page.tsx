
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import DatabaseActions from "./components/database-actions"
import DevOptions from "./components/dev-options"
import Helpers from "./components/helpers"
import { options } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"

export default async function DevsPage() {

  const session = await getServerSession(options)

  if (!session) redirect('/signin')

  try {

    const data = await prisma.maintenancerecords.count({
      where: {
        status: "On-process"
      }
    })

    return (
      <div className="h-max p-4 space-y-2 overflow-y-scroll scroll">
        <DatabaseActions
          email={(session.user as UserSession).email}
          isAllowed={data > 0} />
        <br />
        {/* {
          process.env.DATABASE_URL?.includes("net") ? (
            <div className="space-y-2">
              <h1 className="font-semibold text-2xl text-gray-500">Helpers</h1>
              <Separator />
              <p className="text-sm text-gray-600 py-10 max-w-[50%] text-center">
                This feature is not available in production for security reasons.
                Please perform the database operations in a development environment.
              </p>
            </div>
          ) : (
          )
        } */}
        <Helpers />
        <br />
        <DevOptions />
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting devs page.", "GET", "Fatal", "", "/devs")
    return (
      <div className="min-w-screen min-h-screen flex items-center justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0019"
          fatal
        />
      </div>
    )
  }
}