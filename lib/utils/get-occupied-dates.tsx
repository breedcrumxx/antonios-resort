'use server'

import { headers } from "next/headers";
import prisma from "../prisma";
import { systemLogger } from "./api-debugger";

export const getOccupiedDates = async (packageid: string) => {

  try {

    const packageslots = await prisma.packages.findUnique({
      where: {
        id: packageid
      },
      select: {
        booking: {
          where: {
            status: { notIn: ['Cancelled', 'Rejected', "Completed", 'Voided'] }
          },
          select: {
            id: true,
            checkin: true,
            checkout: true,
            status: true,
            quantity: true
          }
        },
        maxpax: true
      }
    })

    if (!packageslots) return { status: 404 }

    return { status: 200, data: packageslots.booking, extra: packageslots.maxpax }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Hiding custompackage.", "GET", "Moderate", "", "/lib/utils/get-occupied")
    return { status: 500, error: JSON.stringify(error, Object.getOwnPropertyNames(error)) }
  }

}