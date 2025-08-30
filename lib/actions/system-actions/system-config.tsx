'use server'

import { defaultReservationConfig, ReservationConfigType } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import prisma from "@/lib/prisma"


export const getSystemConfig = async <T,>(target: string, def: T): Promise<{
  status: 200,
  data: T
} | {
  status: 500
}> => {
  try {

    const data = await prisma.system.findUnique({
      where: {
        name: target
      }
    })

    const config = await verifyConfig<T>(data, target, def)

    return { status: 200, data: config }
  } catch (error) {
    console.error(error)
    return { status: 500 }
  }
}