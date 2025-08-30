import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export default async function VisitCounter() {

  try {

    const device = headers().get("sec-ch-ua-platform") || "Unknown"
    const address = headers().get("x-forwarded-for") || "Unknown"

    const data = await prisma.sitevisit.findFirst({
      where: {
        address: address
      }
    })

    if (!data) {
      await prisma.sitevisit.create({
        data: {
          device: device,
          address: address,
          date: new Date(),
        }
      })
    }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Adding to site visit.", "GET", "Minor", "", "/visit-counter")
  }

  return (
    <></>
  )
}