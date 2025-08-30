'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getUsersInfo = async (): Promise<{
  status: 200;
  data: {
    totalusers: number;
    totalroles: number;
    totalblocked: number;
  };
} | {
  status: 500;
}> => {
  try {

    const totalusers = await prisma.user.count()
    const totalroles = await prisma.role.count()
    const totalblocked = await prisma.user.count({
      where: {
        block: {
          gte: new Date()
        }
      }
    })

    return {
      status: 200, data: {
        totalusers,
        totalroles,
        totalblocked,
      }
    }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting users data.", "GET", "Minor", "", "/user-info")
    return { status: 500 }
  }
}