'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"

export const extendBooking = async (
  bookingid: string,
  prevtotal: number,
  addedprice: number,
  prevdays: number,
  addeddays: number,
  newcheckout: Date,
) => {
  try {

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: {
          id: bookingid,
        },
        data: {
          total: (prevtotal + addedprice),
          days: (prevdays + addeddays),
          checkout: newcheckout,
        }
      })

      await tx.balancerecord.createMany({
        data: [
          {
            bookingid: bookingid,
            type: "Extension",
            record: `Extended for another ${addeddays} night/s for a total of ${addedprice.toLocaleString()}.`,
            total: addedprice,
          },
          {
            bookingid: bookingid,
            type: "Extension payment",
            record: `Payment for extending for another ${addeddays} night/s.`,
            total: parseFloat("-" + addedprice),
          },
        ]
      })
    })

    createUserLog("Extended a booking stay.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Extending booking.", "POST", "Moderate", "", "/extend-booking")
    return { status: 500 }
  }
}