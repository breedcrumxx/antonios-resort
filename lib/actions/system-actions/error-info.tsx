'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getErrorsInfo = async (filter: string): Promise<{
  status: 200;
  data: {
    reported: number;
    records: {
      severity: string;
      count: number;
    }[];
  };
} | {
  status: 500;
}> => {
  try {

    const start = new Date(new Date().getTime() - (process.uptime() / (60 * 60)))

    let query = {}

    if (filter != "All") {
      query = {
        where: {
          datetime: {
            gte: start
          }
        }
      }
    }

    const reported = await prisma.problemreport.count({
      ...query
    })

    const recorded = await prisma.systemerrorlogs.groupBy({
      by: ['severity'],
      ...query,
      _count: {
        severity: true,
      },
    })

    const records = recorded.map((item) => ({ severity: item.severity, count: item._count.severity }))

    return {
      status: 200, data: {
        reported,
        records,
      }
    }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting errors info.", "GET", "Minor", "", "/error-info")
    return { status: 500 }
  }
}