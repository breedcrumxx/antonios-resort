'use server'

import { defaultCancellationPolicy } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getCancellationPolicy = async () => {
  try {

    const data = await prisma.system.findUnique({
      where: {
        name: "cancellationpolicy"
      }
    })

    const cancellationpolicy = await verifyConfig(data, "cancellationpolicy", defaultCancellationPolicy)

    return { status: 200, data: cancellationpolicy }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting cancellation policy content.", "GET", "Minor", "", "/get-cancellation-policy")
    return { status: 500 }
  }
}