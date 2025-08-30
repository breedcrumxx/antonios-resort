'use server'

import { options } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"

export const createNotification = async (head: string, content: string, type: string, extra?: string, extratype?: string) => {
  try {

    const session = await getServerSession(options)

    await prisma.notification.create({
      data: {
        head: head,
        content: content,
        type: type,
        date: new Date(),
        userid: session?.user?.id,
        extra: extra,
        extratype: extratype,
      }
    })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Creating notification.", "POST", "Moderate", "", "/notification-actions")
  }
}

export const countUnreadNotifications = async (type: string) => {
  try {

    const data = await prisma.notification.count({
      where: {
        read: false,
        type: type
      }
    })

    return { status: 200, data: data }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Counting notifications.", "GET", "Minor", "", "/notification-actions")
    return { status: 500, data: 0 }
  }
}

export const getNotifications = async (type: string, page: number, tab: string) => {
  try {

    let query = {
      where: {
        type: type,
        read: {}
      },
    }

    if (tab != "All") {
      query = {
        where: {
          type: type,
          read: false
        },
      }
    }

    const data = await prisma.notification.findMany({
      ...query,
      include: {
        user: true,
      },
      orderBy: {
        date: 'desc'
      },
      take: 10 * page,
    })

    const dataCount = await prisma.notification.count({
      where: {
        type: type
      }
    })

    const maxPage = Math.ceil(dataCount / 10)

    return { status: 200, data: data, maxPage }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting notifications.", "GET", "Moderate", "", "/notification-actions")
    return { status: 500 }
  }
}

export const read = async (notificationid: string) => {
  try {

    await prisma.notification.update({
      where: {
        id: notificationid
      },
      data: {
        read: true,
      }
    })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Marking notification as read.", "POST", "Minor", JSON.stringify({ notificationid }), "/notification-actions")
  }
}

export const readAll = async (type: string) => {
  try {

    await prisma.notification.updateMany({
      where: {
        type: type
      },
      data: {
        read: true
      }
    })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Marking all notifications as read.", "POST", "Minor", JSON.stringify({ type }), "/notifications-action")
  }
}
