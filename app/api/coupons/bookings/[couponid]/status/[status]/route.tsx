'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request, context: { params: { couponid: string, status: string } }) {

  const { searchParams } = new URL(req.url)

  const page = parseInt(searchParams.get("page") || "1")
  const searchValue = searchParams.get("searchvalue")
  const searchBy = searchParams.get("searchby")
  const range = searchParams.get("range")
  const offset = (page - 1) * 10

  let query: any = {
    couponids: {
      has: context.params.couponid
    },
  }

  if (context.params.status != "All") {
    query = {
      ...query,
      status: context.params.status
    }
  }

  if (searchBy == "id") {
    query = {
      ...query,
      bookingid: {
        startsWith: searchValue,
        mode: 'insensitive',
      }
    }
  }
  if (searchBy == "name") {
    query = {
      ...query,
      client: {
        firstname: {
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
      checkin: {
        gte: new Date(from),
        lte: new Date(to),
      }
    }
  }

  try {

    const data = await prisma.booking.findMany({
      skip: offset,
      take: 10,
      where: {
        ...query,
      },
      select: {
        id: true,
        bookingid: true,
        client: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        checkout: true,
        checkin: true,
        status: true,
        packagedata: true,
      }
    })

    const test = [
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
      data[0],
    ]

    const datacount = await prisma.booking.count({
      where: {
        ...query
      }
    })

    const pages = Math.ceil(datacount / 10)

    const fixedData = data.map((item) => ({ ...item, package: JSON.parse(item.packagedata) }))

    return NextResponse.json({ data: fixedData, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting coupon details.", "GET", "Moderate", "", "/details")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}