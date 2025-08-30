'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { useRating } from "../provider"

export default function PackageDetails() {

  const { packagedata } = useRating()

  return (
    <>
      {
        packagedata ? (
          <div className="w-full flex gap-2">
            <div className="min-h-[100px] min-w-[100px] max-h-[100px] max-w-[100px] overflow-hidden flex items-center justify-center bg-gray-500">
              <img className="w-full h-auto" src={packagedata.images[0]} alt="" />
            </div>
            <div>
              <p className="capitalize font-semibold text-xl">{packagedata.packagename}</p>
              <p className="text-sm text-justify">{packagedata.packagedescription.slice(0, 100)}</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex gap-2">
            <Skeleton className="min-h-[100px] min-w-[100px] max-h-[100px] max-w-[100px] bg-gray-500" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-300" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        )
      }
    </>
  )
}