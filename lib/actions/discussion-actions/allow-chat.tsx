'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { chat } from "@/lib/zod/z-schema"
import { z } from "zod"

export const allowChat = async (discussionid: string) => {
  try {

    await prisma.discussion.update({
      where: {
        id: discussionid
      },
      data: {
        chats: {
          create: {
            content: "You are now able to interact in this discussion.",
            date: new Date().getTime(),
            sender: "Client",
            type: "system"
          }
        },
        allowinteract: true,
        status: "On-process",
        recentactivity: new Date().getTime()
      }
    })

    createUserLog("Sent a message.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Allowing user to intereact.", "POST", "Fatal", JSON.stringify({ discussionid }), "/send-message")
    return { status: 500 }
  }
}

export const sendStaticMessage = async (message: z.infer<typeof chat>): Promise<{
  status: 200;
  data: number;
} | {
  status: 500;
  data: number;
}> => {
  try {

    await prisma.$transaction(async (tx) => {
      const response = await tx.discussion.update({
        where: {
          id: message.discussionid,
        },
        data: {
          recentactivity: new Date().getTime(),
          chats: {
            create: {
              date: message.date,
              type: message.type,
              content: message.content,
              sender: message.sender,
            },
          },
        },
      });

      await tx.chat.updateMany({
        where: {
          discussionid: response.id,
          seen: false,
          sender: message.sender == "Client" ? "Admin" : "Client",
        },
        data: {
          seen: true,
        },
      });

      await createUserLog("Sent a message.")
    })

    return { status: 200, data: message.date }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending a message.", "POST", "Fatal", JSON.stringify({ message }), "/send-message")
    return { status: 500, data: message.date }
  }
}