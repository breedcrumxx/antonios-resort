import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"
export async function GET(req: Request) {

  try {
    const device = req.headers.get("sec-ch-ua-platform") as string
    const address = req.headers.get("x-forwarded-for") as string

    await prisma.sitevisit.create({
      data: {
        device: device,
        address: address,
        date: new Date(),
      }
    })

    return NextResponse.json({ status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 500 })
  }
}