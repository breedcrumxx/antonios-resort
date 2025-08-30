'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { getMonthlyDateRanges } from "./bar-graph-data"

export const getAgeDistributionData = async (year: number): Promise<{
  status: 200;
  data: {
    totaladults: number;
    totalsenior: number;
    totalteens: number;
    monthlydistributions: {
      id: number;
      adults: number;
      senior: number;
      teens: number;
    }[];
  };
} | {
  status: 500
}> => {
  try {

    const range = getMonthlyDateRanges(year)
      .sort((a, b) => a.start.getTime() - b.start.getTime()) // sort date from lowest to highest

    const data = await prisma.booking.findMany({
      where: {
        status: "Completed",
        checkout: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 12, 1),
        }
      },
      select: {
        adults: true,
        seniorpwds: true,
        teenkids: true,
        checkout: true,
      }
    })

    // get total distributions
    const totaladults = data.reduce((a, b) => a + b.adults, 0)
    const totalsenior = data.reduce((a, b) => a + b.seniorpwds, 0)
    const totalteens = data.reduce((a, b) => a + b.teenkids, 0)

    // process the montly distributions
    const monthlydistributions = range.map((item, i) => {
      const filteredbookings = data
        .filter((x) => x.checkout.getTime() >= item.start.getTime() && x.checkout.getTime() <= item.end.getTime())

      const currentadults = filteredbookings.reduce((a, b) => a + b.adults, 0)
      const currentsenior = filteredbookings.reduce((a, b) => a + b.seniorpwds, 0)
      const currentteens = filteredbookings.reduce((a, b) => a + b.teenkids, 0)

      return {
        id: i,
        adults: currentadults,
        senior: currentsenior,
        teens: currentteens
      }
    })

    return {
      status: 200, data: {
        totaladults,
        totalsenior,
        totalteens,
        monthlydistributions,
      }
    }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting age distribution data.", "GET", "Minor", "", "/age-distribution-data")
    return { status: 500 }
  }
}