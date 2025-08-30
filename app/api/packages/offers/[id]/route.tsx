import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { extendedpackageoffer } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import z from 'zod'

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { id: string } }) {

  try {

    const data = await prisma.packages.findUnique({
      where: {
        id: context.params.id
      },
      include: {
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

    if (!data) return NextResponse.json({ message: "Package not found!" }, { status: 404 })

    const results: z.infer<typeof extendedpackageoffer> = {
      ...data,
      day_tour: JSON.parse(data.day_tour as string),
      night_tour: JSON.parse(data.night_tour as string),
      regular_stay: JSON.parse(data.regular_stay as string),
      booking: [],
      bookingcount: 0,
      avgratings: data.ratings.reduce((a, b) => {
        return a + ((Object.values(b).reduce((a, b) => a + b, 0)) / 4)
      }, 0) / data.ratings.length,
      ratingcount: data.ratings.length,
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {

    await systemLogger(error, Object.fromEntries(headers()), "Requesting package pages.", "GET", "Minor", "", "/api/packages/custompackages/")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}