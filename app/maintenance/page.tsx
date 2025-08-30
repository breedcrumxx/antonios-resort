'use client'

import { Result } from "antd"

export default function MaintenancePage() {

  return (
    <div className="min-w-screen min-h-screen max-h-screen max-w-screen flex justify-center items-center">
      <Result
        status="warning"
        title="Website under maintenance!"
        subTitle="Website under maintenance, please wait while we are fixing things up!"
      />
    </div>
  )
}