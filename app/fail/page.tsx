'use client'

import { Result } from "antd"

export default function MiddlewareFailed() {

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        className="w-[50vw]"
        status="500"
        title={"Seems like there's an issue with the middleware!"}
        subTitle={"Please wait while we are addressing the issue, we will come back!"}
      />
    </div>
  )
}