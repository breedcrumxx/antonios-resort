'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { getMonthlyDateRanges } from "./bar-graph-data"

export const getLineGraphData = async (years: number): Promise<{
  status: 200;
  data: {
    year: number;
    monthlydata: {
      id: number;
      earnings: number;
    }[];
  }[];
} | {
  status: 500;
}> => {
  try {

    const range = Array.from({ length: years + 1 }, (_, i) => years - i).map((item) => new Date().getFullYear() - item)

    // const currentYearDateRanges = getMonthlyDateRanges(new Date().getMonth() + 1, new Date().getFullYear())
    const yearDateRanges = range.map((item) => ({
      year: item,
      cover: {
        start: new Date(item, 0, 1),
        end: new Date(item, 12, 0),
      },
      monthlyranges: getMonthlyDateRanges(item)
    })).sort((a, b) => a.year - b.year)

    const bookings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        checkout: {
          gte: yearDateRanges[0].cover.start,
          lte: yearDateRanges[yearDateRanges.length - 1].cover.end,
        }
      },
      select: {
        packagedata: true,
        balance: true,
        total: true,
        checkout: true,
      }
    })

    const segregatedbookings = yearDateRanges.map((item) => {
      return {
        year: item.year,
        monthlydata: item.monthlyranges.map((iter) => {

          // get the booking of this month 
          const bookingcollection = bookings
            .filter((booking) => new Date(booking.checkout).getTime() >= iter.start.getTime() && new Date(booking.checkout).getTime() <= iter.end.getTime())

          const refundable = bookingcollection
            .map((item) => item.balance.reduce((a, b) => a + b.total, 0))
            .reduce((a, b) => a + b, 0)

          const bookingtotal = bookingcollection.reduce((a, b) => a + b.total, 0) + refundable

          return {
            id: iter.start.getMonth(), earnings: bookingtotal
          }
        })
      }
    })

    return { status: 200, data: segregatedbookings }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/line-graph-data")
    return { status: 500 }
  }
}

export type LineGraphData = {
  year: number;
  monthlydata: {
    id: number;
    earnings: number;
  }[];
}[]