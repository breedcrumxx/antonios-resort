import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { extendedpackageoffer } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import z from 'zod'

export const dynamic = "force-dynamic"
export async function GET(req: Request) {

  try {

    const res = await prisma.packages.findMany({
      include: {
        booking: {
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

    const data: z.infer<typeof extendedpackageoffer>[] = res.map((item) => {
      return {
        ...item,
        day_tour: JSON.parse(item.day_tour as string),
        night_tour: JSON.parse(item.night_tour as string),
        regular_stay: JSON.parse(item.regular_stay as string),
        booking: [],
        bookingcount: item.booking.length,
        avgratings: item.ratings.reduce((a, b) => {
          return a + (Object.values(b).reduce((a, b) => a + b, 0) / 4)
        }, 0) / item.ratings.length,
        ratings: [],
        ratingcount: item.ratings.length,
      }
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {

    await systemLogger(error, Object.fromEntries(headers()), "Requesting package pages.", "GET", "Minor", "", "/api/packages/custompackages/")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}