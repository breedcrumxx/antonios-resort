'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import bcrypt from 'bcrypt'
import { createUserLog } from "./create-user-log"

export const changePassword = async (email: string, password: string) => {
  try {

    const data = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        password: true
      }
    })

    // missing data
    if (!data) return { status: 404 }

    const passwordMatched = await bcrypt.compare(password, data.password)

    // same password
    if (passwordMatched) return { status: 202 }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword
      }
    })

    createUserLog("Changed account password.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Changing account password.", "POST", "Fatal", JSON.stringify({ email, password }), "/change-password")
    return { status: 500 }
  }
}