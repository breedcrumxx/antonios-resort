'use server'

// Import PrismaClient instance
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";

// /**
//  * 
//  * @param filter - FilterDateObject
//  * @returns Number - number of bookings received base on given filter
//  */
export const getChipData = async (filter: FilterDateObject) => {
  try {

    const data = await prisma.booking.findMany({
      where: {
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      },
      select: {
        status: true,
      }
    })

    const received = await prisma.booking.count({
      where: {
        book_at: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      }
    })
    const completed = data.filter((item) => item.status == "Completed").length
    const cancelled = data.filter((item) => item.status == "Cancelled").length
    const rejected = data.filter((item) => item.status == "Rejected").length

    return { status: 200, data: { received, completed, cancelled, rejected } }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting sales data.", "GET", "Minor", "", "/get-total-booking")
    return { status: 500, data: 0 }
  }
}

export type DataStripType = {
  received: number,
  completed: number,
  cancelled: number,
  rejected: number
}
