import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function GET() {
  try {

    const data = await prisma.schedule.findMany({})

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting default schedule data.", "GET", "Minor", "", "/schedules")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}