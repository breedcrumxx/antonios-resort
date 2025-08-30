import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // check for active maintenance
    const data = await prisma.maintenancerecords.findFirst({
      where: {
        status: "On-process"
      }
    })

    if (!data) return NextResponse.json({ status: 204 }) // no maintenance

    // check if the maintenance is still valid
    if (data.end.getTime() < new Date().getTime()) { // past maintenance
      // update the maintenance to completed
      await prisma.maintenancerecords.update({
        where: {
          id: data.id
        },
        data: {
          status: "Completed",
          lastupdated: new Date()
        }
      })
      return NextResponse.json({ status: 204 }) // no active maitenance
    }

    return NextResponse.json(data, { status: 200 }) // there is active maintenance

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Checking maintenance.", "GET", "Fatal", "", "/maintenance/active")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}