import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const searchby = searchParams.get('searchby')
  const searchvalue = searchParams.get('searchvalue')
  const status = searchParams.get("status") as string

  let query: any = {}

  if (status != "All") {
    query = {
      status: status
    }
  }

  if (searchvalue && searchby) {

    if (searchby == "code") {
      query = {
        ...query,
        couponcode: {
          contains: searchvalue,
          mode: 'insensitive'
        }
      }
    }
    if (searchby == "label") {
      query = {
        ...query,
        couponname: {
          contains: searchvalue,
          mode: 'insensitive'
        }
      }
    }
  }

  try {

    const data = await prisma.coupon.findMany({
      where: {
        ...query,
      },
      include: {
        bookings: {
          select: {
            id: true,
          }
        },
        user: {
          select: {
            id: true,
          }
        },
      }
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting coupons.", "GET", "Minor", "", "/coupons")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}