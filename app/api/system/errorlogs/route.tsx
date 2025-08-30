import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const limit = parseInt(searchParams.get("limit") as string) || 8
    const range = searchParams.get("range")
    const searchBy = searchParams.get("searchBy")
    const searchValue = searchParams.get("searchValue")
    const severity = searchParams.get("severity")
    const method = searchParams.get("method")
    const sort = searchParams.get("sort") as "asc" | "desc"
    const offset = (page - 1) * limit

    let query = {}

    if (range) {
      const { from, to } = JSON.parse(range)

      query = {
        ...query,
        datetime: {
          gte: new Date(from),
          lte: new Date(to),
        }
      }
    }

    if (searchBy && searchValue) {
      if (searchBy == "error") {
        query = {
          ...query,
          code: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      }
      if (searchBy == "url") {
        query = {
          ...query,
          requesturl: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      }
      if (searchBy == "activity") {
        query = {
          ...query,
          useraction: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      }
    }

    if (method && method != "All") {
      query = {
        ...query,
        requestmethod: method
      }
    }

    if (severity) {
      query = {
        ...query,
        severity: severity
      }
    }

    const data = await prisma.systemerrorlogs.findMany({
      take: limit,
      skip: offset,
      where: {
        ...query,
      },
      orderBy: {
        datetime: sort,
      },
      include: {
        user: {
          include: {
            role: true,
          }
        }
      }
    })

    const datacount = await prisma.systemerrorlogs.count({
      where: {
        ...query
      },
    })

    const pages = Math.ceil(datacount / limit)

    return NextResponse.json({ data: data, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting error logs.", "GET", "Minor", "", "/errorlogs")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}