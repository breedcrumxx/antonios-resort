'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import { getSystemInfo } from "@/lib/actions/system-actions/system-info"
import { format } from "date-fns"
import { Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export default function SystemTile() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<{
    uptime: number,
    cpuusage: number,
    memoryusage: number,
    encounterederrors: number,
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSystemInfo()

      if (response.status == 500) {
        setError(true)
        return
      }

      setData({
        uptime: response.data.uptime,
        cpuusage: (response.data.systemcpu.system / 1e6) / 3600,
        memoryusage: (response.data.systemmemory.heapTotal / (1024 * 1024)),
        encounterederrors: response.data.response,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

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
      {
        !data ? (
          <>
            <div className="stat-title">System</div>
            <Monitor className="my-2 text-blue-500 h-8 w-8" />
            <p className="text-green-500 text-xl font-bold">Running</p>
            <div className="my-2">
              <p className="text-sm">Up time: unknown</p>
              <p className="text-sm">CPU Work Time: unknown</p>
              <p className="text-sm">Memory usage: unknown</p>
              <p className="text-sm">Encountered errors: unknown</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - {format(new Date(), "PPP")}</p>
          </>
        ) : (
          <>
            <div className="stat-title">System</div>
            <Monitor className="my-2 text-blue-500 h-8 w-8" />
            <p className="text-green-500 text-xl font-bold">Running</p>
            <div className="my-2">
              <p className="text-sm">Up time:
                {Math.floor(data.uptime / (60 * 60))}h {Math.floor((data.uptime % (60 * 60)) / 60)}m {(data.uptime % 60).toFixed(0)}s</p>
              <p className="text-sm">Server CPU Time: {data.cpuusage.toFixed(2)} hrs</p>
              <p className="text-sm">Memory usage: {data.memoryusage.toFixed(0)} mb</p>
              <p className="text-sm">Encountered errors: {data.encounterederrors}</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - today {format(new Date(), "h:mm a")}</p>
          </>
        )
      }
    </div>
  )
}