import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { status: string } }) {

  try {

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") as string) || 1
    const searchby = searchParams.get("searchby")
    const searchvalue = searchParams.get("searchvalue")
    const date = JSON.parse(searchParams.get("date") as string) as FilterDateObject
    const offset = (page - 1) * 10

    let query = {
      status: "Completed",
      bookingid: {},
      client: {},
      checkout: {
        gte: new Date(date.get.start),
        lte: new Date(date.get.end)
      },
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

    const data = await prisma.booking.findMany({
      take: 10,
      skip: offset,
      select: {
        id: true,
        bookingid: true,
        // startdate: true,
        bookinglog: true,
        packagedata: true,
        balance: true,
        client: true,
        total: true,

        days: true,
        refund: true,
      },
      orderBy: {
        book_at: 'desc'
      },
      where: {
        ...query
      }
    })

    const responses = data.map((item) => {

      const bookingpackage = JSON.parse(item.packagedata)

      return {
        id: item.id,
        guestname: item.client.firstname + " " + item.client.lastname,
        packagename: bookingpackage.packagename,
        refundable: item.refund?.isvalid || false,
        refundableamount: item.refund?.refundables || 0,
        total: item.total
      }
    })

    // get the data count

    const datacount = await prisma.booking.count({
      where: {
        ...query
      }
    })

    // calculate the pages
    const pages = Math.ceil(datacount / 10)

    return NextResponse.json({ data: responses, maxpage: pages, datacount: datacount }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}