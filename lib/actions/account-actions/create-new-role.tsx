'use server'

import prisma from "@/lib/prisma"
import { role } from "@/lib/zod/z-schema"
import z from 'zod'
import { createUserLog } from "./create-user-log"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const createNewRole = async (values: z.infer<typeof role>) => {
  try {

    await prisma.role.create({
      data: {
        role: values.role,
        systemcontrol: values.systemcontrol,
        businesscontrol: values.businesscontrol,
        websitecontrol: values.websitecontrol,
        utilityaccess: values.utilityaccess,
        websiteaccess: values.websiteaccess,
      }
    })

    createUserLog("Added a new role")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Creating role.", "PUT", "Moderate", JSON.stringify(values), "/create-new-role")
    return { status: 500 }
  }
}

export const editRole = async (values: z.infer<typeof role>) => {

  try {

    await prisma.role.update({
      where: {
        id: values.id
      },
      data: {
        role: values.role,
        systemcontrol: values.systemcontrol,
        businesscontrol: values.businesscontrol,
        websitecontrol: values.websitecontrol,
        utilityaccess: values.utilityaccess,
        websiteaccess: values.websiteaccess,
      }
    })

    createUserLog("Updated a role")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating role.", "POST", "Moderate", JSON.stringify(values), "/create-new-role")
    return { status: 500 }
  }
}