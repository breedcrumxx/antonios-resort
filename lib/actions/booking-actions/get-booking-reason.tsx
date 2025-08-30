'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getBookingReason = async (bookingid: string) => {
  try {

    const data = await prisma.booking.findUnique({
      where: {
        id: bookingid
      },
      select: {
        rejectionandcancellation: true
      }
    })

    if (!data) {
      return { status: 404, data: null }
    }

    return { status: 200, data: data.rejectionandcancellation }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting cancellation/rejection reason.", "GET", "Minor", "", "/get-booking-reason")
    return { status: 500, data: null }
  }
}