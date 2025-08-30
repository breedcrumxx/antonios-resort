import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { id: string } }) {

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') as string

  let query: any = {
    status: {
      notIn: ['Deleted', 'Disabled']
    },
    validuntil: {
      gt: new Date(),
    },
  }

  if (filter != 'all') {
    query = {
      ...query,
      applicableto: filter
    }
  }

  try {
    const data = await prisma.user.findUnique({
      where: {
        id: context.params.id
      },
      select: {
        mycoupons: {
          where: {
            ...query
          },
          select: {
            id: true,
            couponcode: true,
            couponname: true,
            coupondescription: true,
            create_at: true,
            validuntil: true,
            type: true,
            max: true,
            status: true,
            percent: true,
            amount: true,
            minamount: true,
            applicableto: true,
            bookings: {
              where: {
                clientid: context.params.id
              },
              select: {
                clientid: true,
              }
            },
          },
          take: 10,
          orderBy: {
            validuntil: 'desc'
          }
        }
      }
    })



    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting coupons.", "GET", "Minor", "", "/coupons/mycoupons")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}