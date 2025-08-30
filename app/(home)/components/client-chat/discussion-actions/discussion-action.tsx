'use server'

import { createUserLog } from "@/lib/actions/account-actions/create-user-log"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { chat } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { z } from "zod"

export const getDiscussion = async (discussionid: string) => {
  try {
    const data = await prisma.discussion.findUnique({
      where: {
        discussionid: discussionid
      },
      include: {
        booking: {
          include: {
            refund: true
          }
        },
        user: true,
      }
    })

    if (!data) return { status: 404 }

    return { status: 200, data: data }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting discussion.", "GET", "Minor", JSON.stringify({ discussionid }), "/get-discussion")
    return { status: 500 }
  }
}

export const getDiscussionMessages = async (discussionid: string, page: number): Promise<{
  status: 500 | 404
} | {
  status: 200,
  data: z.infer<typeof chat>[],
  hasmore: boolean,
}> => {
  try {

    const data = await prisma.chat.findMany({
      where: {
        discussionid: discussionid
      },
      take: 10 * page,
      orderBy: {
        date: 'desc'
      }
    })

    if (!data) return { status: 404 }

    const dataCount = await prisma.chat.count({
      where: {
        discussionid: discussionid
      }
    })

    const maxData = Math.ceil(dataCount / 10)

    return { status: 200, data: data, hasmore: maxData > page }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting discussion.", "GET", "Moderate", JSON.stringify({ discussionid }), "/get-discussion")
    return { status: 500 }
  }
}

export const checkDiscussion = async (discussionid: string) => {
  try {
    const data = await prisma.discussion.findUnique({
      where: {
        discussionid: discussionid
      }
    })

    if (!data) return { status: 404 }

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Checking discussion.", "GET", "Minor", JSON.stringify({ discussionid }), "/get-discussion")
    return { status: 500 }
  }
}

export const closeCurrentDiscussion = async (discussionid: string, initiator?: string) => {

  try {

    let defaults = [
      {
        date: new Date().getTime(),
        type: "system",
        status: "sent",
        content: "You closed this discussion, and in view mode.",
        sender: "Client",
      },
      {
        date: new Date().getTime(),
        type: "system",
        status: "sent",
        content: "The user closed this discussion.",
        sender: "Admin",
      }
    ]

    if (initiator) {
      defaults = [
        {
          date: new Date().getTime(),
          type: "system",
          status: "sent",
          content: "The admin closed this discussion.",
          sender: "Client",
        },
        {
          date: new Date().getTime(),
          type: "system",
          status: "sent",
          content: "You closed this discussion.",
          sender: "Admin",
        }
      ]
    }

    await prisma.discussion.update({
      where: {
        id: discussionid
      },
      data: {
        status: "Closed",
        allowinteract: false,
        chats: {
          create: defaults
        }
      }
    })

    createUserLog("Closed a discussion.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Closing discussion.", "POST", "Moderate", JSON.stringify({ discussionid, initiator }), "/get-discussion")
    return { status: 500 }
  }
}

export const markDiscussionAsRefunded = async (discussionid: string, bookingid: string) => {
  try {

    let defaults = [
      {
        date: new Date().getTime(),
        type: "system",
        status: "sent",
        content: "You marked the request as refunded.",
        sender: "Admin",
      },
      {
        date: new Date().getTime(),
        type: "system",
        status: "sent",
        content: "Admin marked this as refunded.",
        sender: "Client",
      },
    ]
    let data: any = {
      chats: {
        create: defaults
      }
    }

    return await prisma.$transaction(async (tx) => {
      await tx.discussion.update({
        where: {
          id: discussionid
        },
        data: data
      })

      // search for the booking
      const booking = await tx.booking.findUnique({
        where: {
          id: bookingid,
        }
      })

      if (!booking) return { status: 404 }

      await tx.refunds.update({
        where: {
          id: booking.refundid as string
        },
        data: {
          refunded: true
        }
      })

      await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          refund: {

          }
        }
      })

      await createUserLog("Refunded on a discussion.")

      return { status: 200 }
    })


  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Refunded on a discussion.", "POST", "Moderate", JSON.stringify({ discussionid, close }), "/discussion-action")
    return { status: 500 }
  }
}