import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { id: string } }) {

  try {
    const response = await prisma.booking.findUnique({
      where: {
        id: context.params.id
      },
      include: {
        client: true,
        transaction: true,
        balance: {
          select: {
            total: true
          }
        },
        legal: true,
        refund: true,
        bookinglog: true,
        appliedcoupons: {
          select: {
            couponcode: true,
            status: true,
            percent: true,
            amount: true,
            minamount: true,
          }
        },
      }
    })

    // check if the data is not null
    if (!response) {
      return NextResponse.json({ status: 204 })
    }

    // throw new Error()
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting booking data.", "GET", "Moderate", "", "/bookings/[id]")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}