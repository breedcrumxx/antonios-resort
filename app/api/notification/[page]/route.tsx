import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export async function GET(req: Request, context: { params: { page: string } }) {

  const page = parseInt(context.params.page as string) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {

    const data = await prisma.notification.findMany({
      skip,
      take: limit,
      orderBy: {
        date: 'desc'
      }
    });

    const totalNotifications = await prisma.notification.count();
    const hasMore = page * limit < totalNotifications;

    return NextResponse.json({ data, hasMore }, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }

}