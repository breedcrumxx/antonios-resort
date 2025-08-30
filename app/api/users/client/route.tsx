import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const searchBy = searchParams.get("searchby")
    const searchValue = searchParams.get("searchvalue")
    const sort = searchParams.get("sort") as "asc" | "desc"
    const range = searchParams.get("range") as "asc" | "desc"
    const status = searchParams.get("status") as "active" | "blocked"
    const offset = (page - 1) * 10

    let query: any = {
      role: {
        role: "Client"
      },
      firstname: {},
      email: {},
      roleid: {},
      datecreated: {},
    }

    if (searchBy && searchValue) {
      if (searchBy == "name") {
        query = {
          ...query,
          firstname: {
            startsWith: searchValue,
            mode: 'insensitive',
          }
        }
      } else {
        query = {
          ...query,
          email: {
            startsWith: searchValue,
            mode: 'insensitive',
          }
        }
      }
    }

    if (range) {
      const { from, to } = JSON.parse(range)

      query = {
        ...query,
        datecreated: {
          gte: new Date(from),
          lte: new Date(to),
        }
      }
    }

    if (status == "blocked") {
      query = {
        ...query,
        AND: [
          { block: { gte: new Date() } }
        ]
      }
    }

    const data = await prisma.user.findMany({
      take: 10,
      skip: offset,
      where: {
        ...query
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        datecreated: true,
        role: true,
        block: true,
      },
      orderBy: {
        datecreated: sort
      }
    })

    if (!data) {
      return NextResponse.json({ message: "No data found!" }, { status: 200 })
    }

    const datacount = await prisma.user.count({
      where: {
        ...query
      }
    })

    const pages = Math.ceil(datacount / 8)

    return NextResponse.json({ data, maxpage: pages }, { status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting member list.", "GET", "Minor", "", "/api/users/members")
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 })
  }

}