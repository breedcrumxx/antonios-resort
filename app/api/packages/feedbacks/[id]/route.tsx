import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") as string)
    const rating = parseInt(searchParams.get("rating") as string)

    let threshold = { start: 0, end: 0 }

    if (rating == 1) {
      threshold = { start: 0, end: 1.9 }
    }
    if (rating == 2) {
      threshold = { start: 2, end: 2.9 }
    }
    if (rating == 3) {
      threshold = { start: 3, end: 3.9 }
    }
    if (rating == 4) {
      threshold = { start: 4, end: 4.9 }
    }
    if (rating == 5) {
      threshold = { start: 5, end: 5 }
    }

    const feedbacks = await prisma.ratinglinks.findMany({
      where: {
        used: true,
        packageid: context.params.id,
      },
      include: {
        booking: {
          select: {
            client: {
              select: {
                firstname: true,
                lastname: true,
                image: true,
              }
            }
          }
        },
      },
      orderBy: {
        rated_at: 'desc'
      },
    })

    const filteredfeedbacks = feedbacks.filter((item) => {
      const avg = (item.experience + item.cleanliness + item.facility + item.service) / 4
      if (threshold.end == 0) return true
      return avg >= threshold.start && avg <= threshold.end
    })

    const maxPage = Math.ceil(filteredfeedbacks.length / 10)

    return NextResponse.json({ feedbacks: filteredfeedbacks.slice(0, 10), hasmore: maxPage > page }, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting feedbacks.", "GET", "Moderate", "", "/feedbacks")
    return NextResponse.json({ message: 'Internal server error!' }, { status: 500 })
  }
}