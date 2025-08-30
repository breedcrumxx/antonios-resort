'use client'

import { Separator } from '@/app/components/ui/separator'
import { Rate } from 'antd'
import clsx from 'clsx'
import { useRating } from '../provider'

export default function StarPicker() {

  const { packagerate, setPackagerate, rateErrors } = useRating()

  return (
    <>
      <Separator className="my-4" />
      <div className="flex items-center justify-between px-10 gap-2">
        <h1 className={clsx("text-md", {
          "text-red-500": rateErrors.experience
        })}>Experience in Antonio&apos;s:</h1>
        <Rate
          value={packagerate.experience}
          onChange={(e) => setPackagerate((prev) => ({ ...prev, experience: e }))}
        />
      </div>
      <div className="flex items-center justify-between px-10 gap-2">
        <h1 className={clsx("text-md", {
          "text-red-500": rateErrors.facility
        })}>Facility and environment:</h1>
        <Rate
          value={packagerate.facility}
          onChange={(e) => setPackagerate((prev) => ({ ...prev, facility: e }))}
        />
      </div>
      <div className="flex items-center justify-between px-10 gap-2">
        <h1 className={clsx("text-md", {
          "text-red-500": rateErrors.cleanliness
        })}>Cleanliness:</h1>
        <Rate
          value={packagerate.cleanliness}
          onChange={(e) => setPackagerate((prev) => ({ ...prev, cleanliness: e }))}
        />
      </div>
      <div className="flex items-center justify-between px-10 gap-2">
        <h1 className={clsx("text-md", {
          "text-red-500": rateErrors.service
        })}>Crews&apos; service:</h1>
        <Rate
          value={packagerate.service}
          onChange={(e) => setPackagerate((prev) => ({ ...prev, service: e }))}
        />
      </div>
      <br />
    </>
  )
}