'use server'

import prisma from "@/lib/prisma"
import { add, sub } from "date-fns"
import { createUserLog } from "./create-user-log"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const blockAUser = async (userid: string) => {

  try {
    await prisma.user.update({
      where: {
        id: userid
      },
      data: {
        block: add(new Date(), { years: 500 })
      }
    })

    createUserLog("Blocked a user.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Blocking a user", "POST", "Moderate", JSON.stringify({ userid }), "/actions/account-actions/block-user")
    return { status: 500 }
  }
}

export const unblockAUser = async (userid: string) => {
  try {

    await prisma.user.update({
      where: {
        id: userid
      },
      data: {
        block: null // make the block expired
      }
    })

    createUserLog("Unblocked a user.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Blocking a user", "POST", "Moderate", JSON.stringify({ userid }), "/actions/account-actions/block-user")
    return { status: 500 }
  }
}