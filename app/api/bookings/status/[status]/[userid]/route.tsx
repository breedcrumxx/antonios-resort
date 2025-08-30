import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { status: string, userid: string } }) {

  try {

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") as string) || 1
    const sort = searchParams.get("sort") as "desc" | "asc"
    const range = searchParams.get("range")
    const searchvalue = searchParams.get("searchvalue")
    const offset = (page - 1) * 10

    let query = {
      status: {},
      book_at: {},
      checkin: {},
      bookingid: {},
      clientid: context.params.userid
    }

    if (context.params.status != "All") {
      query = {
        ...query,
        status: context.params.status
      }
    }

    if (searchvalue && searchvalue.length > 0) {
      query = {
        ...query,
        bookingid: {
          startsWith: searchvalue,
          mode: 'insensitive',
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

    const data = await prisma.booking.findMany({
      skip: offset,
      take: 10,
      include: {
        client: true,
        refund: true,
        transaction: true,
      },
      orderBy: {
        book_at: sort
      },
      where: {
        ...query
      }
    })

    if (!data) {
      return NextResponse.json({ message: "No data found!" }, { status: 200 })
    }

    // get the data count
    const datacount = await prisma.booking.count({
      where: {
        ...query
      }
    })

    // calculate the pages
    const pages = Math.ceil(datacount / 10)

    const result = data.map((item) => ({ ...item, package: JSON.parse(item.packagedata).packagename }))

    return NextResponse.json({ data: result, maxpage: pages }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting booking data.", "GET", "Moderate", "", "/[userid]")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}