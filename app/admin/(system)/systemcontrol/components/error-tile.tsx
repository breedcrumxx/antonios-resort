'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { getErrorsInfo } from "@/lib/actions/system-actions/error-info"
import { format } from "date-fns"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

export default function ErrorsTile() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [filter, setFilter] = useState<string>("All")

  // values
  const [data, setData] = useState<{
    recorded: number,
    reported: number,
    fatal: number,
    moderate: number,
    minor: number,
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getErrorsInfo(filter)

      if (response.status == 500) {
        setError(true)
        return
      }

      setData({
        recorded: response.data.records.reduce((a, b) => a + b.count, 0),
        reported: response.data.reported,
        fatal: response.data.records.find((item) => item.severity == "Fatal")?.count || 0,
        moderate: response.data.records.find((item) => item.severity == "Moderate")?.count || 0,
        minor: response.data.records.find((item) => item.severity == "Minor")?.count || 0,
      })
      setLoading(false)
    }

    setLoading(true)
    fetchData()
  }, [filter])

  return (
    <div className="h-full flex flex-col rounded-lg p-4 shadow bg-white aspect-square relative">
      <LoadingCurtain
        custom={<>
          {
            error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>}
        open={loading || error} />
      <Select value={filter} onValueChange={(e) => setFilter(e)}>
        <SelectTrigger className="absolute w-max right-4 top-4 z-5">
          <SelectValue placeholder="Target" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="uptime">Up-time</SelectItem>
        </SelectContent>
      </Select>

      {
        !data ? (
          <>
            <div className="stat-title">Errors</div>
            <X className="my-2 text-red-500 h-8 w-8" />
            <div className="my-2">
              <p className="text-sm">Recorded: unknown</p>
              <p className="text-sm">Reported: unknown</p>
              <p className="text-sm"><span className="text-red-500">Fatal</span>: unknown</p>
              <p className="text-sm"><span className="text-orange-500">Moderate</span>: unknown</p>
              <p className="text-sm">Minor: unknown</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - {format(new Date(), "PPP")}</p>
          </>
        ) : (
          <>
            <div className="stat-title">Errors</div>
            <X className="my-2 text-red-500 h-8 w-8" />
            <div className="my-2">
              <p className="text-sm">Recorded: {data.recorded.toLocaleString()}</p>
              <p className="text-sm">Reported: {data.reported.toLocaleString()}</p>
              <p className="text-sm"><span className="text-red-500">Fatal</span>: {data.fatal.toLocaleString()}</p>
              <p className="text-sm"><span className="text-orange-500">Moderate</span>: {data.moderate.toLocaleString()}</p>
              <p className="text-sm">Minor: {data.minor.toLocaleString()}</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - today {format(new Date(), "h:mm a")}</p>
          </>
        )
      }
    </div>
  )
}