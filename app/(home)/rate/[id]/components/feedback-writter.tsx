'use client'

import { Textarea } from "@/app/components/ui/textarea"
import { useRating } from "../provider"
import clsx from "clsx"

export default function FeedbackWriter() {

  const { setPackagerate, rateErrors } = useRating()

  return (
    <>
      <h1 className={clsx("font-semibold", {
        "text-red-500": rateErrors.personalfeedback
      })}>Write your feedback?</h1>
      <Textarea onChange={(e) => setPackagerate((prev) => ({ ...prev, personalfeedback: e.target.value }))} placeholder="Write us a feedback about your stay with us..." />
    </>
  )
}