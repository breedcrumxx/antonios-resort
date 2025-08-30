'use server'

import MaintenanceProvider from "@/app/providers/maintenance-provider"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import React from "react"
import { z } from "zod"

export default async function MaintenanceWrapper({ children }: { children: React.ReactNode }) {

  try {

    const data = await prisma.maintenancerecords.findFirst({
      where: {
        status: "On-process"
      },
    })

    if (data && data.end.getTime() < new Date().getTime()) { // update the process to completed
      await prisma.maintenancerecords.update({
        where: {
          id: data.id
        },
        data: {
          status: "Completed"
        }
      })
    }

    return (
      <MaintenanceProvider data={data as z.infer<typeof maintenanceschema>}>
        {children}
      </MaintenanceProvider>
    )
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting maintenance data.", "GET", "Fatal", "", "/maintenance-wrapper")
    return (
      <div className="min-w-screen min-h-screen max-h-screen max-w-screen flex justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="WRAP-ERR-0001"
          subtitle="An error occured while accessing the page, please try again later!"
          fatal
        />
      </div>
    )
  }
}