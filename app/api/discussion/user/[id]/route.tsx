import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { id: string } }) {

  try {
    const data = await prisma.user.findUnique({
      where: {
        id: context.params.id
      },
      select: {
        discussion: true,
      }
    })

    if (!data) {
      return NextResponse.json({ status: 404 })
    }

    return NextResponse.json(data.discussion, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}