'use client'

import { Result } from "antd"

export default function NotAllowedPage() {

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        className="w-[50vw]"
        status="403"
        title={"Restricted!"}
        subTitle={"We are very sorry, but you are not allowed to access this page."}
      />
    </div>
  )
}