'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request, context: { params: { couponid: string } }) {

  const { searchParams } = new URL(req.url)

  const page = parseInt(searchParams.get("page") || "1")
  const searchValue = searchParams.get("searchvalue")
  const searchBy = searchParams.get("searchby")
  const sort = searchParams.get("sort") as "asc" | "desc"

  let query: any = {
    mycouponids: {
      has: context.params.couponid
    },
  }

  let sorted: any = {
    orderBy: {
      firstname: sort
    }
  }

  if (searchBy && searchValue) {
    if (searchBy == "email") {
      query = {
        ...query,
        email: {
          startsWith: searchValue,
          mode: "insensitive"
        }
      }

      sorted = {
        orderBy: {
          email: sort
        }
      }
    } else {
      query = {
        ...query,
        firstname: {
          startsWith: searchValue,
          mode: "insensitive"
        }
      }
    }
  }

  try {

    const data = await prisma.user.findMany({
      take: 10,
      skip: 10 * (page - 1),
      where: {
        ...query,
      },
      ...sorted,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        datecreated: true,
        role: true,
        block: true,
      }
    })

    if (!data) return NextResponse.json({ message: "Coupon not found!" }, { status: 404 })

    const datacount = await prisma.user.count({
      where: {
        ...query
      }
    })

    const pages = Math.ceil(datacount / 10)

    return NextResponse.json({ data: data, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting coupon details.", "GET", "Moderate", "", "/details")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}