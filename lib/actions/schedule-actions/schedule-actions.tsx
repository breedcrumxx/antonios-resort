'use server'

import prisma from "@/lib/prisma"
import { defaultschedules } from "@/lib/zod/z-schema"
import z from 'zod'
import { createUserLog } from "../account-actions/create-user-log"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

const insertDefaultSchedule = defaultschedules.omit({
  id: true,
  status: true,
  price: true,
})

export const createDefaultSchedule = async (values: z.infer<typeof insertDefaultSchedule>) => {
  let action = "Creat"

  try {

    const existing = await prisma.schedule.findFirst({
      where: {
        type: values.type,
        slot: values.slot
      }
    })

    if (!existing) {
      // create
      await prisma.schedule.create({
        data: values
      })
      action = "Creat"
    } else {
      // update
      await prisma.schedule.update({
        where: {
          id: existing.id
        },
        data: {
          timein: values.timein,
          timeout: values.timeout,
          duration: values.duration,
        }
      })
      action = "Updat"
    }

    createUserLog(`${action}ed a default schedule!`)

    if (action == "Creat") {
      return { status: 201 }
    } else {
      return { status: 202 }
    }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `${action}ing a default schedule`, "POST", "Moderate", JSON.stringify({ values }), "/schedule-actions")
    return { status: 500 }
  }
}

export const updateDefaultSchedule = async (data: z.infer<typeof defaultschedules>) => {
  try {

    await prisma.schedule.update({
      where: {
        id: data.id
      },
      data: {
        type: data.type,
        slot: data.slot,
        timein: data.timein,
        timeout: data.timeout,
        duration: data.duration,
      }
    })

    createUserLog("Updated a default schedule!")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating a default schedule!", "POST", "Moderate", JSON.stringify({ data }), "/schedule-action")
    return { status: 500 }
  }
}

export const deleteDefaultSchedule = async (scheduleid: string) => {
  try {

    await prisma.schedule.delete({
      where: {
        id: scheduleid
      }
    })

    createUserLog("Deleted a default schedule!")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Deleting a default schedule.", "DELETE", "Minor", JSON.stringify({ scheduleid }), "/schedule-actions")
    return { status: 500 }
  }
}