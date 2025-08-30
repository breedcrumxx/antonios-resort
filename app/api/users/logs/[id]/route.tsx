import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const filename = "/api/users/logs/"

export async function GET(req: Request, context: { params: { id: string } }) {

  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const range = searchParams.get("range")
    const sort = searchParams.get("sort") as "desc" | "asc"
    const offset = (page - 1) * 10

    let query = {
      logdate: {},
      userid: context.params.id
    }

    if (range) {
      const { from, to } = JSON.parse(range)

      query = {
        ...query,
        logdate: {
          gte: new Date(from),
          lte: new Date(to),
        }
      }
    }

    const data = await prisma.userlogs.findMany({
      take: 10,
      skip: offset,
      where: {
        ...query
      },
      orderBy: {
        logdate: sort
      }
    })

    if (!data) return NextResponse.json({ message: "Not found!" }, { status: 404 })

    const datacount = await prisma.userlogs.count({
      where: {
        ...query
      }
    })

    const pages = Math.ceil(datacount / 10)

    return NextResponse.json({ data: data, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting user logs.", "GET", "Moderate", "", "/logs")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}