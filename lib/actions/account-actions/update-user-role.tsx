'use server'

import prisma from "@/lib/prisma"
import { createUserLog } from "./create-user-log"
import { headers } from "next/headers"
import { systemLogger } from "@/lib/utils/api-debugger"

export const updateUserRole = async (userid: string, roleid: string, role?: string) => {
  try {

    if (role) {
      await prisma.$transaction(async (tx) => {
        const selectedRole = await tx.role.findUnique({
          where: {
            role: role
          }
        })

        if (!selectedRole) throw new Error()

        await prisma.user.update({
          where: {
            id: userid
          },
          data: {
            roleid: selectedRole.id
          }
        })

      })

      createUserLog("Demoted a user account.")

      return { status: 200 }
    }

    await prisma.user.update({
      where: {
        id: userid
      },
      data: {
        role: {
          connect: {
            id: roleid
          }
        }
      }
    })

    createUserLog("Assigned a new role to a user.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Assigning role", "POST", "Moderate", JSON.stringify({ userid, roleid, role }), "/actions/account-actions/update-user-role")
    return { status: 500 }
  }
}