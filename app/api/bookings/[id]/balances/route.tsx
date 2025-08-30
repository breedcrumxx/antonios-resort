import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { id: string } }) {

  try {

    const data = await prisma.balancerecord.findMany({
      where: {
        bookingid: context.params.id
      },
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting booking balances.", "GET", "Fatal", "", "/balances")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }

}