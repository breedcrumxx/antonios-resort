import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { extendedpackageoffer } from "@/lib/zod/z-schema";
import { areIntervalsOverlapping } from "date-fns";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from 'zod'

export async function GET(req: Request, context: { params: { id: string } }) {
  try {

    const { searchParams } = new URL(req.url)
    const maxpax = parseInt(searchParams.get("max") as string)
    const range = searchParams.get("range") as string
    const slot = searchParams.get("slot") as string
    const type = searchParams.get("type") as string

    const { from, to } = JSON.parse(range)
    const start = new Date(new Date(from).setHours(0, 0, 0, 0))
    const end = new Date(new Date(to).setHours(23, 59, 59, 999))

    const data = await prisma.packages.findMany({
      where: {
        id: {
          not: context.params.id
        },
        maxpax: {
          gte: maxpax
        },
        type: type,
      },
      include: {
        booking: {
          where: {
            checkin: {
              gte: new Date()
            },
            status: {
              notIn: ['Cancelled', 'Rejected', 'Completed']
            }
          },
          select: {
            checkin: true,
            checkout: true,
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
        }).length,
        avgratings: item.ratings.reduce((a, b) => {
          return a + ((Object.values(b).reduce((a, b) => a + b, 0)) / 4)
        }, 0) / item.ratings.length,
        ratingcount: item.ratings.length,
      }
    })

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting upgrade package suggestions.", "GET", "Minor", "", "/upgrade")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}