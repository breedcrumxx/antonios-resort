'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { balancerecord, extendedpackageoffer, packageoffer } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { z } from "zod"
import { createUserLog } from "../account-actions/create-user-log"

export const upgradeCurrentBooking = async (bookingid: string, packageid: string, newtotal: number, balance: z.infer<typeof balancerecord>) => {
  try {

    await prisma.$transaction(async (tx) => {

      const data = await tx.packages.findFirst({
        where: {
          id: packageid
        },
      })

      if (!data) return { status: 404 }

      const parsed: z.infer<typeof packageoffer> = {
        ...data,
        day_tour: JSON.parse(data.day_tour as string),
        night_tour: JSON.parse(data.night_tour as string),
        regular_stay: JSON.parse(data.regular_stay as string),
      }

      await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          total: newtotal,
          packageid: data.id,
          packagedata: JSON.stringify(parsed),
          balance: {
            updateMany: {
              where: {
                type: "Payment balance"
              },
              data: {
                record: `Updated balance of ₱ ${Math.abs(balance.total).toLocaleString()} for this booking.`,
                total: balance.total
              }
            }
          }
        }
      })
    })

    createUserLog("Upgraded the client booking!")

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Upgrading client package.", "POST", "Moderate", JSON.stringify({ bookingid, packageid }), "/upgrade-booking")
    return { status: 500 }
  }
}