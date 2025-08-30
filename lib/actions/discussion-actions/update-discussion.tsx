'use server'

import prisma from "@/lib/prisma"

export const updateDiscussion = async (discussionid: string, action: string) => {
  try {

    await prisma.discussion.update({
      where: {
        id: discussionid
      },
      data: {
        status: action
      }
    })

    return { status: 200 }
  } catch (error) {
    console.error(error)
    return { status: 500 }
  }
}