'use server'

import { PolicyType } from "@/lib/configs/config-file"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { format } from "date-fns"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { catalog } from "@/lib/zod/z-schema"
import { z } from "zod"

export const saveWebsiteConfiguration = async (target: string, content: string) => {
  try {

    await prisma.system.update({
      where: {
        name: target
      },
      data: {
        config: content
      }
    })

    if (target == "privacypolicy" || target == "cookiepolicy" || target == "termscondition" || target == "agreement") {
      // create a record in catalogs
      await prisma.catalogs.create({
        data: {
          type: target,
          content: JSON.parse(content).content,
          datecreated: new Date()
        }
      })
    }

    createUserLog(`Updated ${target}.`)
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Updates ${target}.`, "POST", "Fatal", JSON.stringify({ target, content }), "/save-important-notes")
    return { status: 500 }
  }
}

export const getConfiguration = async (name: string): Promise<{
  status: 200,
  data: z.infer<typeof catalog>[]
} | {
  status: 404
} | {
  status: 500,
  error: string
}> => {
  try {

    // take 5 recent catalog history
    const catalogs = await prisma.catalogs.findMany({
      where: {
        type: name
      },
      orderBy: {
        datecreated: 'desc'
      },
      take: 5,
    })

    // if no catalog, probably it comes from auto backup
    if (!catalogs.length) {
      const response = await prisma.system.findUnique({
        where: {
          name,
        }
      })

      if (!response) return { status: 404 }

      const data: PolicyType = JSON.parse(response.config)
      const content = `
        <h6 class="heading">Last update ${format(data.lastupdated, 'MMMM dd, yyyy')}</h6>
        <br>
        ${data.content}
      `
      catalogs.push({
        id: response.id,
        type: name,
        content: content,
        datecreated: data.lastupdated
      })
    }

    return { status: 200, data: catalogs }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Requesting config content.`, "GET", "Fatal", JSON.stringify({ name }), "/save-important-notes")
    return { status: 500, error: JSON.stringify(error, Object.getOwnPropertyNames(error)) }
  }
}