'use client'

import { getUserDonutData } from "@/app/admin/(admin)/(dashboard)/analytics/callback-actions/user-data"
import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import clsx from "clsx"
import { useEffect, useState } from "react"

export default function UserStat() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<{
    total: number,
    new: number,
    active: number
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserDonutData()
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }

      setData({
        total: (response.data.active + response.data.inactive) || 0,
        new: response.data.newusers,
        active: (response.data.active / (response.data.active + response.data.inactive)) * 100
      })

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="col-span-3 stats shadow bg-white relative">

      <LoadingCurtain
        custom={<>
          {
            loading ? (
              <></>
            ) : error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>}
        open={loading || error} />

      <>
        <div className="stat w-1/3">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{data?.total.toLocaleString()}</div>
          <div className="stat-desc">Overall users</div>
        </div>

        <div className="stat w-1/3">
          <div className="stat-title">New users</div>
          <div className="stat-value text-primary">{data?.new.toLocaleString()}</div>
          <div className="stat-desc">Registered this month</div>
        </div>

        <div className="stat w-1/3">
          <div className="stat-value text-primary">{data?.active.toFixed(0)}%</div>
          <div className="stat-title">Active users</div>
          <div className={clsx("stat-desc", {
            "text-green-500": data && data.active >= 70,
            "text-red-500": data && data.active < 30
          })}>{
              data && data.active >= 70 ? (
                "Excellent"
              ) : data && data.active < 70 && data.active > 50 ? (
                "Balance"
              ) : data && data.active < 50 && data.active >= 30 ? (
                "Poor"
              ) : data && data.active < 30 && (
                "Alarming"
              )
            }</div>
        </div>
      </>
    </div>
  )
}