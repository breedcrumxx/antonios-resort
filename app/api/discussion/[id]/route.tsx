import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request, context: { params: { id: string } }) {

  try {
    const data = await prisma.discussion.findUnique({
      where: {
        id: context.params.id
      },
      select: {
        chats: true
      }
    })

    if (!data) {
      return NextResponse.json({ status: 404 })
    }

    return NextResponse.json(data.chats, { status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting chats.", "GET", "Minor","", "/discussion/[id]")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}