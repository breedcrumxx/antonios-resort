'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getSystemInfo = async (): Promise<{
  status: 200;
  data: {
    uptime: number;
    systemcpu: NodeJS.CpuUsage;
    systemmemory: NodeJS.MemoryUsage;
    response: number;
  };
} | {
  status: 500;
}> => {
  try {

    const uptime = process.uptime()
    const systemcpu = process.cpuUsage()
    const systemmemory = process.memoryUsage()

    const startDate = new Date(new Date().getTime() - (Math.floor(uptime) * 1000))

    const response = await prisma.systemerrorlogs.count({
      where: {
        datetime: {
          gte: startDate,
          lte: new Date()
        }
      }
    })

    return { status: 200, data: { uptime, systemcpu, systemmemory, response } }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting system info.", "GET", "Minor", "", "/system-info")
    return { status: 500 }
  }
}