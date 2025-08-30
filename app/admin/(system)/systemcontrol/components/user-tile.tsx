'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import { getUsersInfo } from "@/lib/actions/system-actions/user-info"
import { format } from "date-fns"
import { Users } from "lucide-react"
import { useEffect, useState } from "react"

export default function UserTile() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<{
    totalusers: number;
    totalroles: number;
    totalblocked: number;
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUsersInfo()

      if (response.status == 500) {
        setError(true)
        return
      }

      setData({
        totalusers: response.data.totalusers,
        totalroles: response.data.totalroles,
        totalblocked: response.data.totalblocked,
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
            <div className="stat-title">Users</div>
            <Users className="my-2 text-amber-500 h-8 w-8" />
            <div className="my-2">
              <p className="text-sm">Total users: unknown</p>
              <p className="text-sm">Active roles: unknown</p>
              <p className="text-sm">Blocked accounts: unknown</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-sm text-gray-500">Last check - {format(new Date(), "PPP")}</p>
          </>
        ) : (
          <>
            <div className="stat-title">Users</div>
            <Users className="my-2 text-amber-500 h-8 w-8" />
            <div className="my-2">
              <p className="text-sm">Total users: {data.totalusers.toLocaleString()}</p>
              <p className="text-sm">Active roles: {data.totalroles.toLocaleString()}</p>
              <p className="text-sm">Blocked accounts: {data.totalblocked.toLocaleString()}</p>
            </div>
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500">Last check - today {format(new Date(), "h:mm a")}</p>
          </>
        )
      }
    </div>
  )
}