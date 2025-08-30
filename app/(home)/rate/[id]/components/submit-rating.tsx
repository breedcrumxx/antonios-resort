'use client'

import { Button } from "@/app/components/ui/button"
import { insertRating } from "@/lib/actions/booking-actions/rating-actions"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from 'antd'
import { useState } from "react"
import { useRating } from "../provider"

export default function SubmitRating() {

  const { packagerate, rateErrors, setRateErrors, setTab, ratingData } = useRating()

  // states
  const [submitting, setSubmitting] = useState<boolean>(false)

  const handleSubmit = async () => {

    if (!ratingData) {
      message.error("Rating key is missing!")
      return
    }

    const hasEmpty = Object.entries(packagerate).filter(([key, value]) => {
      if (typeof value == "string") {
        return value.length == 0
      } else {
        return value == 0
      }
    }).map(([key, value]) => key)

    if (hasEmpty.length > 0) {
      const errorField = {
        experience: hasEmpty.some((item) => item == "experience"),
        facility: hasEmpty.some((item) => item == "facility"),
        cleanliness: hasEmpty.some((item) => item == "cleanliness"),
        service: hasEmpty.some((item) => item == "service"),
        personalfeedback: hasEmpty.some((item) => item == "personalfeedback"),
      }

      setRateErrors(errorField)
      return
    }

    setSubmitting(true)
    const response = await insertRating(packagerate, ratingData.id)

    if (response.status == 500) {
      message.error("An error occured while processing your request, please try again later!")
      setSubmitting(false)
      return
    }

    setTab("success")
  }

  return (
    <>
      {
        Object.entries(rateErrors).filter(([key, value]) => value).length > 0 && (
          <p className="text-center text-red-500">Please fill in all the rating fields!</p>
        )
      }
      <Button className="w-full bg-prm" onClick={() => handleSubmit()}>Submit</Button>
      <FullCoverLoading open={submitting} defaultOpen={false} loadingLabel="Submitting your feedback, please wait..." />
    </>
  )
}