import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { extendedpackageoffer } from "@/lib/zod/z-schema"
import { areIntervalsOverlapping } from "date-fns"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import z from 'zod'

export const dynamic = "force-dynamic"
export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") as string)
  const heads = searchParams.get("heads")
  const range = searchParams.get("range")
  const type = searchParams.get("type")

  let start: Date | null;
  let end: Date | null;

  let query = {}
  let bquery = {}

  if (heads) {
    query = {
      maxpax: {
        gte: parseInt(heads)
      }
    }
  }

  if (range) {
    const { from, to } = JSON.parse(range)
    start = new Date(new Date(from).setHours(0, 0, 0, 0))
    end = new Date(new Date(to).setHours(23, 59, 59, 999))

    bquery = {
      status: {
        notIn: ['Cancelled', 'Rejected', 'Completed']
      }
    }
  }

  if (type) {
    query = {
      ...query,
      type: type
    }
  }

  try {

    const data = await prisma.packages.findMany({
      where: {
        ...query,
      },
      take: 5,
      skip: 5 * (page - 1),
      include: {
        booking: {
          where: {
            ...bquery
          },
          select: {
            checkin: true,
            checkout: true,
            quantity: true,
          }
        },
        ratings: {
          where: {
            used: true,
          },
          select: {
            experience: true,
            cleanliness: true,
            facility: true,
            service: true,
          }
        },
      }
    })

    const dataCount = await prisma.packages.count({
      where: {
        ...query
      }
    })

    const maxPage = Math.ceil(dataCount / 5)

    const results: z.infer<typeof extendedpackageoffer>[] = data.map((item) => {
      return {
        ...item,
        day_tour: JSON.parse(item.day_tour as string),
        night_tour: JSON.parse(item.night_tour as string),
        regular_stay: JSON.parse(item.regular_stay as string),
        booking: [],
        bookingcount: item.booking.filter((x) => {
          if (!start || !end) return false
          return areIntervalsOverlapping({ start, end }, { start: x.checkin, end: x.checkout }, { inclusive: true })
        }).reduce((a, b) => a + b.quantity, 0),
        avgratings: item.ratings.reduce((a, b) => {
          return a + (Object.values(b).reduce((a, b) => a + b, 0) / 4)
        }, 0) / item.ratings.length,
        ratings: [],
        ratingcount: item.ratings.length,
      }
    })

    return NextResponse.json({ res: results, maxpage: maxPage }, { status: 200 })
  } catch (error) {

    await systemLogger(error, Object.fromEntries(headers()), "Requesting package pages.", "GET", "Minor", "", "/api/packages/custompackages/")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}