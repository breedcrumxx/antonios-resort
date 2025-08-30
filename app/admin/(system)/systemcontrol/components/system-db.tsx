'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import { getDbinfo } from "@/lib/actions/system-actions/db-info"
import clsx from "clsx"
import { format } from "date-fns"
import { Database } from "lucide-react"
import { useEffect, useState } from "react"

export default function DatabaseTile() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<{
    uptime: number,
    size: number,
    tablecount: number,
    responsetime: number,
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDbinfo()

      if (response.status == 500) {
        setError(true)
        return
      }

      setData({
        uptime: response.data.uptime,
        size: response.data.size / (1024 * 1024),
        tablecount: response.data.tablecount,
        responsetime: response.data.responsetime,
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
            <div className="stat-title">Database</div>
            <Database className="my-2 text-green-500 h-8 w-8" />
            <p className="text-green-500 text-xl font-bold">Unknown</p>
            <div className="my-2">
              <p className="text-sm">Up-time: unknown</p>
              <p className="text-sm">Current size: unknown</p>
              <p className="text-sm">Table count: unknown</p>
              <p className="text-sm">Response time: unknown</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - {format(new Date(), "PPP")}</p>
          </>
        ) : (
          <>
            <div className="stat-title">Database</div>
            <Database className="my-2 text-green-500 h-8 w-8" />
            <p className={clsx("text-green-500 text-xl font-bold", {
              "text-red-500": data.responsetime > 500,
              "text-green-500": data.responsetime <= 200,
            })}>{
                data.responsetime > 500 ? (
                  "Slow"
                ) : data.responsetime > 200 ? (
                  "Normal"
                ) : data.responsetime <= 200 && (
                  "Healthy"
                )
              }</p>
            <div className="my-2">
              <p className="text-sm">Up-time: {Math.floor(data.uptime / (60000 * 60))}h {Math.floor((data.uptime % (60000 * 60)) / 60000)}m</p>
              <p className="text-sm">Current size: {(data.size).toFixed(1)} mb</p>
              <p className="text-sm">Table count: {data.tablecount}</p>
              <p className="text-sm">Response time: {data.responsetime} ms</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - today {format(new Date(), "h:mm a")}</p>
          </>
        )
      }
    </div>
  )
}