'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getDbinfo = async (): Promise<{
  status: 200;
  data: {
    uptime: number;
    size: number;
    tablecount: number;
    responsetime: number;
  };
} | {
  status: 500;
}> => {
  try {
    const start = new Date()
    const dbStats = await prisma.$runCommandRaw({ dbStats: 1 })
    const server = await prisma.$runCommandRaw({ serverStatus: 1 })

    return {
      status: 200, data: {
        uptime: server.uptimeMillis as number,
        size: dbStats.dataSize as number,
        tablecount: dbStats.collections as number,
        responsetime: new Date().getTime() - start.getTime()
      }
    }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting db info.", "GET", "Minor", "", "/db-info")
    return { status: 500 }
  }
}