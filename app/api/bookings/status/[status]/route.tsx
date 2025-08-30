import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { status: string } }) {

  try {

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") as string) || 1
    const searchby = searchParams.get("searchby")
    const range = searchParams.get("range")
    const searchvalue = searchParams.get("searchvalue")
    const offset = (page - 1) * 10

    let query = {
      status: {},
      checkin: {},
      bookingid: {},
      client: {},
    }

    if (context.params.status != "All") {
      query = {
        ...query,
        status: context.params.status
      }
    }

    if (searchby == "id") {
      query = {
        ...query,
        bookingid: {
          startsWith: searchvalue,
          mode: 'insensitive',
        }
      }
    }
    if (searchby == "name") {
      query = {
        ...query,
        client: {
          firstname: {
            startsWith: searchvalue,
            mode: 'insensitive',
          }
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
      select: {
        client: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          }
        },
        id: true,
        bookingid: true,
        packagedata: true,
        checkin: true,
        checkout: true,
        status: true,
      },
      orderBy: {
        checkin: 'desc'
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

    const result = data.map((item) => ({ ...item, package: JSON.parse(item.packagedata) }))

    return NextResponse.json({ data: result, maxpage: pages }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}