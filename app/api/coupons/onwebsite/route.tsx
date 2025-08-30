import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  // thrown only the visible coupons
  // if there's user id, throw all coupons, and disable the claimed coupons
  const userid = searchParams.get("userid")

  const filter = searchParams.get("filter") as string
  const search = searchParams.get("search")

  let query: any = {
    type: "anyone"
  }

  if (search) {
    query = {
      couponcode: {
        startsWith: search,
        mode: 'insensitive'
      }
    }
  }

  if (filter != 'all') {
    query = {
      ...query,
      applicableto: filter,
    }
  }

  if (userid) {
    query = {
      ...query,
      user: {
        none: {
          id: userid
        }
      }
    }
  }

  try {

    const data = await prisma.coupon.findMany({
      where: {
        ...query,
        status: {
          in: ['Active', 'Full']
        },
        validuntil: {
          gt: new Date()
        }
      },
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting coupons.", 'GET', 'Moderate', "", "/available")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}