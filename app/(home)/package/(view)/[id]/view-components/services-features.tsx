'use client'

import { usePackageData } from "@/app/providers/package-data-provider"
import { Check } from "lucide-react"

export default function PackageInclusions() {

  const { packagedata } = usePackageData()

  return (
    <div className="w-full min-h-[200px] p-4 bg-white border">
      <div className="w-full flex justify-between">
        <p className="font-semibold">What do we offer?</p>
      </div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-x-4 py-4">
        {
          packagedata?.inclusion.map((item, i) => (
            <div className="flex gap-2" key={i}>
              <Check className="text-green-500 h-4 w-4" />
              <p className="text-sm">{item}</p>
            </div>
          ))
        }
      </div>
    </div>
  )

}