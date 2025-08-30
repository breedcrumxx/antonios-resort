'use server'

import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { base64ToBlob } from "@/lib/utils/b64-blob"
import { headers } from "next/headers"
import { createUserLog } from "./create-user-log"

export const uploadProfileImage = async (userid: string, image: string, previmage: string) => {

  try {

    await prisma.$transaction(async (tx) => {

      let url = "" // url of the uploaded image
      if (previmage.length > 0) { // true then replace
        const res = await backendClient.publicImages.upload({ // then upload the new item
          content: {
            blob: base64ToBlob(image, "image/png"),
            extension: 'png',
          }
        })

        url = res.url // get the url of the image
      } else { // false upload
        const res = await backendClient.publicImages.upload({ // upload the new image
          content: {
            blob: base64ToBlob(image, "image/png"),
            extension: "png",
          },
        })

        url = res.url // get the url of the image
      }

      await tx.user.update({ // update the image of the user
        where: {
          id: userid
        },
        data: {
          image: url
        }
      })

      if (previmage.length > 0) {
        await backendClient.publicImages.deleteFile({ // delete the old image after all is done
          url: previmage,
        });
      }
      createUserLog("Updated profile picture.")
    }, { maxWait: 60000, timeout: 60000 })


    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Uploading profile image.", "POST", "Minor", JSON.stringify({ userid, image, previmage }), "/actions/account-actions/upload-profile-image")

    return { status: 500 }
  }
}