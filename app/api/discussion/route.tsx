import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get("page") as string)
    const search = searchParams.get("search")

    let query: any = {}

    if (search && search.length > 0) {
      query = {
        where: {
          OR: [
            {
              user: {
                email: { contains: search, mode: "insensitive" },
              }
            },
            { discussionid: { contains: search, mode: "insensitive" } },
          ]
        }
      }
    }

    const data = await prisma.discussion.findMany({
      ...query,
      include: {
        booking: true,
        user: true,
        chats: {
          select: {
            seen: true,
          },
          where: {
            sender: "Client",
            seen: false,
            type: "message",
          }
        }
      },
      orderBy: {
        recentactivity: 'desc'
      },
      take: 10 * (page),
    })

    const maxdata = await prisma.discussion.count({
      ...query
    })

    const pagecount = Math.ceil(maxdata / 10)

    return NextResponse.json({ data, hasmore: pagecount > page }, { status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting discussions.", "GET", "Minor", "", "/discussion")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}