'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { months } from "@/lib/utils/month-filter-utils"
import { headers } from "next/headers"

export const getSystemErrorData = async (): Promise<{
  status: 200;
  data: {
    id: number;
    month: string;
    get: number;
    put: number;
    post: number;
    deletem: number;
  }[];
} | {
  status: 500;
}> => {
  try {

    let selectedmonths = months.map((item, i) => {
      return { id: i, start: new Date(new Date().getFullYear(), i, 1), end: new Date(new Date(new Date().getFullYear(), i + 1, 0).setHours(23, 59, 59)) }
    }).sort((a, b) => a.id - b.id)

    const data = await prisma.systemerrorlogs.findMany({
      where: {
        datetime: {
          gte: selectedmonths[0].start,
          lte: selectedmonths[selectedmonths.length - 1].end,
        }
      },
      select: {
        requestmethod: true,
        datetime: true,
      }
    })

    const segregated = selectedmonths.map((item, i) => {
      const get = data
        .filter((x) => x.requestmethod == "GET" && (new Date(x.datetime).getTime() >= new Date(item.start).getTime() && new Date(x.datetime).getTime() <= new Date(item.end).getTime())).length
      const put = data
        .filter((x) => x.requestmethod == "PUT" && (new Date(x.datetime).getTime() >= new Date(item.start).getTime() && new Date(x.datetime).getTime() <= new Date(item.end).getTime())).length
      const post = data
        .filter((x) => x.requestmethod == "POST" && (new Date(x.datetime).getTime() >= new Date(item.start).getTime() && new Date(x.datetime).getTime() <= new Date(item.end).getTime())).length
      const deletem = data
        .filter((x) => x.requestmethod == "DELETE" && (new Date(x.datetime).getTime() >= new Date(item.start).getTime() && new Date(x.datetime).getTime() <= new Date(item.end).getTime())).length

      return { id: item.id, month: months[item.id], get, put, post, deletem }
    })

    return { status: 200, data: segregated }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting error records.", "GET", "Minor", "", "/system-error")
    return { status: 500 }
  }
}