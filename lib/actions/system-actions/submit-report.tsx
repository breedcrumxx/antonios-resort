'use server'

import { options } from "@/app/api/auth/[...nextauth]/options"
import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { base64ToBlob } from "@/lib/utils/b64-blob"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import { createNotification } from "./notification-actions"

export const submitReport = async (currentError: string, code: string, details: string, attachment: string, severity: string) => {

  try {
    const session = await getServerSession(options)

    const res = await backendClient.publicImages.upload({
      content: {
        blob: base64ToBlob(attachment, "image/png"),
        extension: "png",
      },
    })

    const digestedError = JSON.parse(currentError) as Error & { digest?: string }

    const data = await prisma.problemreport.create({
      data: {
        issueid: `${new Date().getTime()}`,
        report: details,
        severity,
        code,
        errormessage: digestedError.message,
        stacktrace: digestedError.stack as string,
        datetime: new Date(),
        image: res.url,
        userid: session?.user?.id,
      }
    })

    createNotification("Report submitted!", "A user submitted an error report, check it now!", "system", data.id, 'reportid')

    return { status: 200 }
  } catch (error) {

    await systemLogger(error, Object.fromEntries(headers()), "Submitting a report.", "PUT", "Fatal", JSON.stringify({
      error: currentError,
      details: details,
      attachment: "image/png(Unable to save)"
    }), "/lib/actions/system-admin-actions/submit-report")

    return { status: 500 }
  }
}