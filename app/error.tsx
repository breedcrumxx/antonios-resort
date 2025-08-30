'use client'

import { Result } from "antd"

export default function DefaultErrorPage() {

  return (
    <div className="min-w-screen min-h-screen max-h-screen max-w-screen flex justify-center items-center">
      <Result
        status="500"
        title="An error occured!"
        subTitle="We are unable to process your request, please try again later!"
      />
    </div>
  )
}