'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { months } from "@/lib/utils/month-filter-utils"
import { headers } from "next/headers"

export const getMonthlyDateRanges = (currentYear: number) => {
  const dateRanges = [];

  let lastmonth = 12

  for (let month = 0; month < lastmonth; month++) {
    const startDate = new Date(currentYear, month, 1);
    const endDate = new Date(currentYear, month + 1, 0); // Last day of the month

    dateRanges.push({
      start: startDate,
      end: endDate,
    });
  }

  return dateRanges;
}

export const getBarGraphData = async (year: number) => {
  try {

    const bookingdata = await prisma.booking.findMany({
      where: {
        checkout: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 12, 1),
        }
      },
      select: {
        status: true,
        checkin: true,
        checkout: true,
      }
    })

    const completed = bookingdata.filter((item) => item.status == "Completed")
    const cancelled = bookingdata.filter((item) => item.status == "Cancelled")
    const rejected = bookingdata.filter((item) => item.status == "Rejected")

    const ranges = getMonthlyDateRanges(year)

    const scales = ranges.map((item) => ({
      id: item.start.getMonth(),
      completed: completed
        .filter((iter) => new Date(iter.checkin).getTime() >= item.start.getTime() && new Date(iter.checkout).getTime() <= item.end.getTime()).length,
      cancelled: cancelled
        .filter((iter) => new Date(iter.checkin).getTime() >= item.start.getTime() && new Date(iter.checkout).getTime() <= item.end.getTime()).length,
      rejected: rejected
        .filter((iter) => new Date(iter.checkin).getTime() >= item.start.getTime() && new Date(iter.checkout).getTime() <= item.end.getTime()).length,
    }))

    const extra = {
      monthavg: scales.reduce((a, b) => a + (b.completed + b.cancelled + b.rejected), 0) / scales.length, avgcompleted: scales.reduce((a, b) => a + b.completed, 0) / scales.length,
      topmonth: months[scales.sort((a, b) => (b.completed + b.cancelled + b.rejected) - (a.completed + a.cancelled + a.rejected))[0].id]
    }

    return { status: 200, data: scales, extra }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/bar-graph-data")
    return { status: 500 }
  }
}