import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { userid: string } }) {

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") as string
  const search = searchParams.get("search")

  let query: any = {
    type: "anyone"
  }

  if (search) {
    query = {
      couponcode: search
    }
  } else if (filter != 'all') {
    query = {
      applicableto: filter,
      type: "anyone",
    }
  }

  try {

    const data = await prisma.coupon.findMany({
      where: {
        ...query,
        status: {
          in: ['Active', 'Full']
        },
        user: {
          none: {
            id: context.params.userid
          }
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