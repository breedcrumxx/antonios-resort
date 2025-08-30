'use client'

import { ErrorFeedback } from "@/lib/utils/error-report-modal"

export default function ReportablePage() {

  try {
    throw new Error("Error Report Demo!")
  } catch (error) {
    return (
      <div className="w-full min-h-screen max-h-screen flex items-center justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0099"
          subtitle="A demo for error reporting!"
        />
      </div>
    )
  }
}