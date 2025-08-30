import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const range = searchParams.get("range")
    const searchBy = searchParams.get("searchBy")
    const searchValue = searchParams.get("searchValue")
    const severity = searchParams.get("severity")
    const sort = searchParams.get("sort") as "asc" | "desc"
    const offset = (page - 1) * 10

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
      if (searchBy == "issueid") {
        query = {
          ...query,
          issueid: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      }
      if (searchBy == "code") {
        query = {
          ...query,
          code: {
            contains: searchValue,
            mode: 'insensitive'
          }
        }
      }
    }

    if (severity) {
      query = {
        ...query,
        severity: severity
      }
    }

    const data = await prisma.problemreport.findMany({
      take: 10,
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

    const datacount = await prisma.problemreport.count({
      where: {
        ...query
      },
    })

    const pages = Math.ceil(datacount / 10)

    return NextResponse.json({ data: data, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting error logs.", "GET", "Minor", "", "/reportlogs")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}