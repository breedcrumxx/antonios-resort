import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, context: { params: { search: string } }) {

  try {

    const { searchParams } = new URL(req.url)

    const filterBy = searchParams.get("by") as string

    let query = {
      email: {},
      firstname: {}
    }

    if (filterBy == "name") {
      query = {
        email: {},
        firstname: {
          startsWith: context.params.search,
          mode: 'insensitive'
        }
      }
    } else {
      query = {
        email: {
          startsWith: context.params.search,
          mode: 'insensitive'
        },
        firstname: {}
      }
    }

    const data = await prisma.user.findMany({
      where: {
        ...query,
      },
      include: {
        role: true,
      }
    })

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error("Error at: /api/users/[search]", error)
    return NextResponse.json({ status: 500 })
  }
}