'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "./create-user-log"

export const replaceEmail = async (newemail: string, prevemail: string) => {
  try {

    await prisma.user.update({
      where: {
        email: prevemail
      },
      data: {
        email: newemail
      }
    })

    createUserLog("Changed email address!")

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Changing email address.", "POST", "Moderate", JSON.stringify({ newemail, prevemail }), "/replace-email")
    return { status: 500 }
  }
}