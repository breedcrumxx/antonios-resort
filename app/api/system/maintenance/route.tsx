import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const sort = searchParams.get("sort") as 'desc' | 'asc'
    const status = searchParams.get("status") as string
    const searchvalue = searchParams.get("searchValue")
    const range = searchParams.get("range")

    let query = {}

    if (status != "All") {
      query = {
        status: status
      }
    }

    if (searchvalue) {
      query = {
        ...query,
        title: {
          startsWith: searchvalue,
          mode: "insensitive",
        }
      }
    }

    if (range) {
      const { from, to } = JSON.parse(range)

      query = {
        ...query,
        start: {
          gte: new Date(from),
          lte: new Date(to),
        }
      }
    }

    const data = await prisma.maintenancerecords.findMany({
      where: {
        ...query
      },
      include: {
        initiator: true
      },
      orderBy: {
        start: sort
      },
      take: 10,
      skip: 10 * (page - 1)
    })

    const maxData = await prisma.maintenancerecords.count({
      where: {
        ...query
      }
    })

    const maxPage = Math.ceil(maxData / 10)

    return NextResponse.json({ data: data, maxpage: maxPage }, { status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting active maintenance.", "GET", "Minor", "", "/system-maintenance")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}