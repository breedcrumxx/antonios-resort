'use server'

import { options } from "@/app/api/auth/[...nextauth]/options"
import { createNotification } from "@/lib/actions/system-actions/notification-actions"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"

export const openDiscussion = async (message: string, type: string, bookingid?: string) => {

  const timestamp = new Date().getTime().toString()

  const session = await getServerSession(options)

  try {

    const data = await prisma.discussion.create({
      data: {
        discussionid: `CT-D-${timestamp}`,
        recentactivity: new Date().getTime(),
        date: new Date(),
        type: type,
        status: "Pending",
        bookingid: bookingid,
        userid: session?.user?.id,
        chats: {
          create: [
            {
              date: new Date().getTime(),
              sender: "Client",
              type: "message",
              content: message,
            },
            {
              date: new Date().getTime(),
              sender: "Admin",
              type: "message",
              content: "Please wait while we are reviewing your request.",
            },
            {
              date: new Date().getTime(),
              sender: "Admin",
              type: "message",
              content: `Please keep this ticket for future reference regarding this issue.`,
            },
            {
              date: new Date().getTime(),
              sender: "Admin",
              type: "message",
              content: `CT-D-${timestamp}`,
            },
            {
              date: new Date().getTime(),
              sender: "Admin",
              type: "system",
              content: "By replying to this chat, you allow this user to interact",
            },
            {
              date: new Date().getTime(),
              sender: "Client",
              type: "system",
              content: "You currently unable to interact in this chat. Please wait for an admin to grant you permission.",
            },
          ]
        },
      }
    })

    createNotification("New discussion", "A user has opened a new discussion, respond now!", "admin", `/admin/inbox/${data.discussionid}`, "link")

    return { status: 200, data: data.discussionid }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Creating a discussion.", "POST", "Moderate", JSON.stringify({ message, type }), "/open-discussion")
    return { status: 500 }
  }

}