'use server'

import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import { createUserLog } from "@/lib/actions/account-actions/create-user-log"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { base64ToBlob } from "@/lib/utils/b64-blob"
import { headers } from "next/headers"
import { io } from "socket.io-client"

export const sendClientMessage = async (discussionid: string, message: string) => {
  try {

    await new Promise(resolve => setTimeout(resolve, 3000))

    await prisma.discussion.update({
      where: {
        id: discussionid
      },
      data: {
        recentactivity: new Date().getTime(),
        chats: {
          create: [
            {
              date: new Date().getTime(),
              type: "message",
              content: message,
              sender: "Client",
            }
          ]
        }
      }
    })

    createUserLog("Sent a message to a discussion.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending image attachment.", "POST", "Moderate", JSON.stringify({ discussionid, attachment: "(image attachment)" }), "/send-client-attachment")
    return { status: 500 }
  }
}


export const sendImageAttachment = async (discussionid: string, image: string) => {
  try {

    const res = await backendClient.publicImages.upload({ // then upload the new item
      content: {
        blob: base64ToBlob(image, "image/png"),
        extension: 'png',
      }
    })

    createUserLog("Sent an attachment to a discussion.")

    return { status: 200, data: res.url }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending image attachment.", "POST", "Moderate", JSON.stringify({ discussionid, attachment: "(image attachment)" }), "/send-client-attachment")
    return { status: 500 }
  }
}