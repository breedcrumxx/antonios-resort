'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getUserDonutData = async (): Promise<{
  status: 200;
  data: {
    active: number;
    inactive: number;
    newusers: number;
  };
} | {
  status: 500;
}> => {
  try {

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const activeUsersCount = await prisma.user.count({
      where: {
        userlogs: {
          some: {
            logdate: {
              gte: threeMonthsAgo,
            },
          },
        },
      },
    });

    const inactiveUsersCount = await prisma.user.count({
      where: {
        userlogs: {
          none: {
            logdate: {
              gte: threeMonthsAgo,
            },
          },
        },
      },
    });

    const newusers = await prisma.user.count({
      where: {
        datecreated: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        }
      }
    })

    return { status: 200, data: { active: activeUsersCount, inactive: inactiveUsersCount, newusers } }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/donut-data")
    return { status: 500 }
  }
}