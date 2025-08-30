'use server'

import { options } from "@/app/api/auth/[...nextauth]/options"
import { debugconfig } from "@/system-debug-config"
import { getServerSession } from "next-auth"
import prisma from "../prisma"

export const systemLogger = async (
  error: unknown,
  headers: {
    [k: string]: string;
  },
  action: string,
  method: string,
  severity: string,
  body: string,
  loc: string
) => {

  const session = await getServerSession(options)

  const userip = headers['x-forwarded-for']
  const requesturl = headers['referer']

  let name = ""
  let message = ""
  let stack = ""

  if (error instanceof Error) {
    name = error.name
    message = error.message
    stack = error.stack || "Unknown"
  }

  try {
    await prisma.systemerrorlogs.create({
      data: {
        message: message,
        code: name,
        stacktrace: stack,
        userip: userip,
        requestmethod: method,
        requesturl: requesturl || "Unknown",
        requestheaders: JSON.stringify(headers) || 'Unknown',
        requestbody: body || "Unknown",
        useraction: action,
        userid: session?.user?.id,
        datetime: new Date(),
        severity: severity,
      }
    })
  } catch (error) {
    console.log(error)
  }

  // DEBUG CONTROL LINE
  if (debugconfig.DEBUG) {
    console.error("Error at: " + loc, error)
  }
}