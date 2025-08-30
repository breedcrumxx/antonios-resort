'use server'

import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { packageoffer } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { z } from "zod"
import { createUserLog } from "../account-actions/create-user-log"

const createPackageType = packageoffer.omit({
  id: true,
})

export const createPackage = async (data: z.infer<typeof createPackageType>) => {
  try {

    const id = await prisma.$transaction(async (tx) => {
      const response = await tx.packages.create({
        data: {
          ...data,
          images: data.images
        }
      })

      const confirmables = data.images.map((item) => {
        return backendClient.publicImages.confirmUpload({
          url: item
        })
      })

      const responses = await Promise.all(confirmables)
      if (responses.some((item) => !item.success)) throw new Error() // cancel the upload if images failed to upload

      return response.id
    })

    createUserLog("Created a package!")

    return { status: 200, data: id }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Creating package.", "PUT", "Fatal", JSON.stringify({ data }), "/package-action")
    return { status: 500 }
  }
}

export const updatePackage = async (data: z.infer<typeof packageoffer>) => {
  try {
    const { id, images, ...info } = data

    await prisma.$transaction(async (tx) => {

      await tx.packages.update({
        where: {
          id: data.id
        },
        data: {
          ...info,
          images: data.images
        }
      })

      const confirmables = images.map((item) => {
        return backendClient.publicImages.confirmUpload({
          url: item
        })
      })

      const responses = await Promise.all(confirmables)
      if (responses.some((item) => !item.success)) throw new Error() // cancel the upload if images failed to upload

    })

    createUserLog("Updated a package!")

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating package.", "POST", "Fatal", JSON.stringify({ data }), "/package-action")
    return { status: 500 }
  }
}

export const removePackage = async (id: string) => {
  try {

    await prisma.packages.update({
      where: {
        id: id
      },
      data: {
        status: "deleted"
      }
    })

    createUserLog("Removed a package.")

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Removed a package.", "DELETE", "Fatal", JSON.stringify({ id }), "/package-action")
    return { status: 500 }
  }
}