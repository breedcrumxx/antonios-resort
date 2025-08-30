'use server'

import prisma from "@/lib/prisma"
import { getStartAndEndDate } from "@/lib/utils/month-filter-utils"

export const getTotalUsers = async () => {
  try {

    const data = await prisma.user.count()

    return { status: 200, data }

  } catch (error) {
    console.error("Error at users.tsx", error)
    return { status: 500 }
  }
}

export const getNewUsers = async (filter: string) => {
  try {

    const { startDate, endDate } = getStartAndEndDate(filter)

    const data = await prisma.user.count({
      where: {
        datecreated: {
          lte: endDate,
          gte: startDate,
        }
      }
    })

    return { status: 200, data }

  } catch (error) {
    console.error("Error at users.tsx", error)
    return { status: 500 }
  }
}