import { devconfig } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { headers } from "next/headers"
import DevsConfigProvider from "./dev-configuration-provider"

export default async function DevConfig({ children }: { children: React.ReactNode }) {

  try {

    const devsconfig = await prisma.system.findUnique({
      where: {
        name: "devs"
      }
    })

    const devs = await verifyConfig(devsconfig, "devs", devconfig)

    return (
      <DevsConfigProvider dev={devs}>
        {children}
      </DevsConfigProvider>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting devs configuration.", "GET", "Fatal", "", "/dev-configuration")

    return (
      <div className="min-w-screen min-h-screen flex items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="WRAP-ERR-0002"
          subtitle={"An unknown error occured, please try again later. We will try and fix things in no time!"}
          fatal
        />
      </div>
    )
  }
}