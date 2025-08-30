import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const searchBy = searchParams.get("searchby")
    const filterBy = searchParams.get("filterby")
    const searchValue = searchParams.get("searchvalue")
    const offset = (page - 1) * 10

    let query: any = {
      firstname: {},
      email: {},
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

    console.log(filterBy)

    if (filterBy != "all") { // with role filter
      query = {
        ...query,
        OR: [
          { role: { id: filterBy } }
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
        image: true,
        block: true,
        role: true,
      },
      orderBy: {
        datecreated: 'desc'
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

    const pages = Math.ceil(datacount / 10)

    return NextResponse.json({ data, maxpage: pages }, { status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting member list.", "GET", "Moderate", "", "/members")
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 })
  }

}