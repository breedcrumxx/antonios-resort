'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { problemreport } from "@/lib/zod/z-schema"
import { z } from "zod"

export const createCase = async (issueid: number, sample: string, code: string, includeall: boolean) => {
  try {

    const sampleids: string[] = [sample]
    await prisma.$transaction(async (tx) => {
      if (includeall) {
        await tx.problemreport.updateMany({ // only include the reports that is relevant and still unsolved
          where: {
            code: code,
            status: {
              not: "Solved"
            }
          },
          data: {
            status: "Staged"
          }
        })

        const data = await tx.problemreport.findMany({
          where: {
            code: code,
            status: "Staged"
          },
          select: {
            id: true
          }
        })

        sampleids.push(...data.map((item) => item.id))
      }

      await tx.issue.create({
        data: {
          issueid: issueid,
          sampleids: Array.from(new Set(sampleids)), // connect all the ids of the relevant data to this issue
        }
      })

      await createUserLog("Opened a new issue on github.")
    })

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "", "PUT", "Moderate", "", "/case-actions")
    return { status: 500 }
  }
}


export const getSamplesOfThisIssue = async (issueid: number): Promise<{
  status: 500;
} | {
  status: 404
} | {
  status: 200;
  data: z.infer<typeof problemreport>[]
}> => {
  try {
    const data = await prisma.issue.findUnique({
      where: {
        issueid: issueid,
      },
      select: {
        samples: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                image: true,
                role: true,
              }
            },
          }
        }
      }
    })

    if (!data) return { status: 404 }

    return { status: 200, data: data.samples as z.infer<typeof problemreport>[] }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting issue samples!", "GET", "Minor", "", "/case-action")
    return { status: 500 }
  }
}