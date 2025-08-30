'use server'

import { options } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"

const filename = "create-user-logs"

/**
 * Responsible for createing user logs in the system
 * @param activity - String activity of a user
 * @param webloc - String location of the user in the website
 */
export const createUserLog = async (activity: string) => {
  const session = await getServerSession(options)

  if (session) {

    const userip = headers().get("x-forwarded-for") || "Unknown"
    const device = headers().get("sec-ch-ua-platform") || "Unknown"
    const webloc = headers().get("referer") || "Unknown"

    try {

      await prisma.user.update({
        where: {
          id: (session.user as UserSession).id
        },
        data: {
          userlogs: {
            create: {
              ipaddress: userip,
              device: device,
              activity: activity,
              weblocation: webloc,
              logdate: new Date(),
            }
          }
        }
      })

    } catch (error) {
      await systemLogger(error, Object.fromEntries(headers()), "Creating user log", "POST", "Fatal", JSON.stringify({ activity }), "/actions/account-actions/create-user-log")
    }
  }
}