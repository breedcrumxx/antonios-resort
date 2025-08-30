'use client'

import { Result } from "antd"

export default function CustomNotFound() {

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        className="w-[50vw]"
        status="404"
        title={"Your data went missing!"}
        subTitle={"We cannot find what you're looking for."}
      />
    </div>
  )
}