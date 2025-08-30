'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { Check, CircleOff, FileSymlink, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useFilter } from "../provider"
import { DataStripType, getChipData } from "@/lib/actions/dashboard-calls/reservation-overview/get-total-bookings"
import React from "react"

export default function DataStrip() {

  const { filter } = useFilter()

  // states
  const [state, setState] = useState<JSX.Element | null>(
    <Skeleton className="h-4 w-24 bg-gray-500" />
  )

  // values
  const [value, setValue] = useState<DataStripType | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getChipData(filter)

      if (response.status == 500) {
        setState(<p className="text-xs font-semibold">Received <span className="text-red-500">0</span></p>)

        return
      }
      setValue(response.data as DataStripType)
      setState(null)
    }

    setState((
      <Skeleton className="h-4 w-24 bg-gray-500" />
    ))
    fetchData()
  }, [filter])

  return (
    <>
      {
        state ? (
          <>
            {state}
            {state}
            {state}
            {state}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold flex gap-2"><FileSymlink className="h-4 w-4 text-green-500" /> Received <span className="text-gray-500">{value?.received}</span></p>
            <p className="text-xs font-semibold flex gap-2"><Check className="h-4 w-4 text-blue-500" /> Completed <span className="text-gray-500">{value?.completed}</span></p>
            <p className="text-xs font-semibold flex gap-2"><CircleOff className="h-4 w-4 text-red-500" /> Cancelled <span className="text-gray-500">{value?.cancelled}</span></p>
            <p className="text-xs font-semibold flex gap-2"><X className="h-4 w-4 text-red-500" /> Rejected <span className="text-gray-500">{value?.rejected}</span></p>
          </>
        )
      }
    </>
  )
}