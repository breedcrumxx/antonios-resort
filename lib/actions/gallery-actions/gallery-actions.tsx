'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { collection } from "@/lib/zod/z-schema"
import { z } from "zod"
import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"

const createcollection = collection.omit({ id: true, createdat: true })

export const createNewCollection = async (values: z.infer<typeof createcollection>) => {
  try {

    await prisma.$transaction(async (tx) => {

      await tx.collection.create({
        data: {
          ...values,
          createdat: new Date()
        }
      })

      const confimables = values.images.map((item) => backendClient.publicImages.confirmUpload({ url: item }))

      const responses = await Promise.all(confimables)

      if (responses.some((item) => !item.success)) throw new Error("An image cannot be confirmed!")

    })

    createUserLog("Created a new collection.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Creating a new collection.", "PUT", "Moderate", JSON.stringify({ values }), '/gallery-action')
    return { status: 500 }
  }
}

export const updateCollection = async (values: z.infer<typeof collection>): Promise<{
  status: 200;
} | {
  status: 500;
}> => {
  try {

    await prisma.collection.update({
      where: {
        id: values.id
      },
      data: {
        collectionname: values.collectionname,
        collectiondescription: values.collectiondescription,
        images: values.images
      }
    })

    createUserLog("Updated a collection.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating a collection.", "POST", "Moderate", JSON.stringify({ values }), '/gallery-action')
    return { status: 500 }
  }
}

export const deleteCollection = async (data: z.infer<typeof collection>): Promise<{
  status: 200;
} | {
  status: 500;
}> => {
  try {
    await prisma.collection.delete({
      where: {
        id: data.id
      }
    })

    const removables = data.images.map((item) => backendClient.publicImages.deleteFile({ url: item }))
    await Promise.all(removables)

    createUserLog("Deleted a collection")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Deleting a collection.", "DELETE", "Moderate", JSON.stringify({ data }), '/gallery-action')
    return { status: 500 }
  }
}

export const removeSomeImages = async (id: string, images: string[], removable: string[]) => {
  try {
    await prisma.collection.update({
      where: {
        id: id
      },
      data: {
        images: images
      }
    })

    const removables = removable.map((item) => backendClient.publicImages.deleteFile({ url: item }))
    await Promise.all(removables)

    createUserLog("Removed some images from a collection.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Removing some images from a collection.", "DELETE", "Moderate", JSON.stringify({ id, images, removable }), '/gallery-action')
    return { status: 500 }
  }
}

export const getCollections = async (): Promise<{
  status: 200;
  data: {
    id: string;
    collectionname: string;
    collectiondescription: string;
    images: string[];
    createdat: Date;
  }[];
} | {
  status: 500;
}> => {
  try {
    const data = await prisma.collection.findMany()

    return { status: 200, data }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Getting collections.", "GET", "Moderate", "", '/gallery-action')
    return { status: 500 }
  }
}