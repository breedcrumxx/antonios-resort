'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { offensiveWords } from "@/lib/configs/config-file"
import { Profanity } from "@2toad/profanity"

export const insertRating = async (rating: PackageRateType, rateid: string) => {
  try {

    const profanity = new Profanity({
      languages: ['en', 'es'],
      wholeWord: false,
      grawlix: '*****',
    });

    profanity.addWords(offensiveWords)

    const censored = profanity.censor(rating.personalfeedback);

    await prisma.ratinglinks.update({
      where: {
        id: rateid
      },
      data: {
        experience: rating.experience,
        facility: rating.facility,
        cleanliness: rating.cleanliness,
        service: rating.service,
        comment: censored,
        used: true,
        rated_at: new Date(),
      }
    })

    createUserLog("Submitted a rating.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Submitting a ratings.", "POST", "Moderate", JSON.stringify({ rating, rateid }), "/rating-active")
    return { status: 500 }
  }
}