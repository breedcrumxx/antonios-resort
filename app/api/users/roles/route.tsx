import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const data = await prisma.role.findMany()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error at: /api/users/roles.", error)
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 })
  }
}