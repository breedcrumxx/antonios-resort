'use client'

import { Spinner } from "@nextui-org/spinner"

export default function Loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Spinner label="Loading, please wait..." />
    </div>
  )
}