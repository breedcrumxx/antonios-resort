'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getRolesDistribution = async (): Promise<{
  status: 200;
  data: {
    role: string;
    count: number;
  }[];
} | {
  status: 500;
}> => {
  try {

    const data = await prisma.role.findMany({
      select: {
        role: true,
        _count: {
          select: {
            user: true,
          },
        },
      },
    });

    return { status: 200, data: data.sort((a, b) => b._count.user - a._count.user).map((item) => ({ role: item.role, count: item._count.user })) }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting role distribution.", "GET", "Minor", "", "/system-role")
    return { status: 500 }
  }
}