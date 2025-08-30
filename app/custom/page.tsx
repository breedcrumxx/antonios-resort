import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { options } from "../api/auth/[...nextauth]/options"
import BaseInfoEditor from "./components/base-info-editor"
import PackageImageDropper from "./components/package-image-dropper"
import PackageInclusion from "./components/package-inclusion"
import PackageSummaryWrapper from "./components/package-summary-wrapper"
import CustomPackageProvider from "./provider"
import { defaultschedules } from "@/lib/zod/z-schema"
import { z } from "zod"

export default async function CustomPage({ searchParams }: { searchParams: { id: string | null | undefined } }) {

  // check the user session
  const session = await getServerSession(options)

  if (!session) {
    redirect('/signin?callback=/custom')
  }

  try {
    const schedules = await prisma.schedule.findMany()

    return (
      <CustomPackageProvider packageid={searchParams.id} scheduleSuggestions={schedules as z.infer<typeof defaultschedules>[]}>
        <div className="min-w-screen min-h-[100vh] bg-muted">
          <div className="w-full flex justify-center">
            <div className="w-[1000px] flex flex-col space-y-2 py-2">
              <PackageImageDropper />
              <div className="w-full flex gap-2">
                <div className="w-3/4 space-y-2">
                  <BaseInfoEditor />
                  <PackageInclusion />
                </div>
                <div className="w-1/4 space-y-2">
                  <PackageSummaryWrapper user={session.user as UserSession} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomPackageProvider>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting data for custom package.", "GET", "Moderate", "", "/custom")
    throw error
  }
}