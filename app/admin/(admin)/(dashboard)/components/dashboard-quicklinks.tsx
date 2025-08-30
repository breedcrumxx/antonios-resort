'use client'

import { useEffect, useState } from "react"
import LoadingCurtain from "../analytics/components/loading-curtain"
import { BookCheck, CircleDotDashed, Clock } from "lucide-react"
import { getDashboardWindowData } from "@/lib/actions/dashboard-calls/dashboard/dashboard-stats"
import { useRouter } from "next/navigation"


type QuickLinksDataType = {
  bookings: number,
  pending: number,
  ongoing: number,
}

export default function DashboardQuickLinks() {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(true)

  // values
  const [data, setData] = useState<QuickLinksDataType>({
    bookings: 0,
    pending: 0,
    ongoing: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDashboardWindowData()
      setLoading(false)
      if (response.status == 500) {
        setError(true)
        return
      }

      setData(response.data)

    }

    fetchData()
  }, [])

  return (
    <div className="stats shadow w-full bg-white relative">
      <LoadingCurtain
        open={loading}
        custom={<>
          {
            loading ? (
              <p className="text-black">Picking up scattered data...</p>
            ) : error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>
        }
      />
      <div className="stat cursor-pointer hover:bg-muted/40" onClick={() => {
        router.push("/admin/bookings")
      }}>
        <div className="stat-figure text-primary">
          <BookCheck className="w-8 h-8" />
        </div>
        <div className="stat-title">Bookings</div>
        <div className="stat-value text-primary">{data.bookings}</div>
        <div className="stat-desc">Received this month</div>
      </div>

      <div className="stat cursor-pointer hover:bg-muted/40" onClick={() => {
        sessionStorage.setItem("filter", "Pending")
        router.push("/admin/bookings")
      }}>
        <div className="stat-figure">
          <CircleDotDashed className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="stat-title">Pending</div>
        <div className="stat-value text-primary">{data.pending}</div>
        <div className="stat-desc">Yet to approve</div>
      </div>

      <div className="stat cursor-pointer hover:bg-muted/40" onClick={() => {
        sessionStorage.setItem("filter", "Ongoing")
        router.push("/admin/bookings")
      }}>
        <div className="stat-figure">
          <Clock className="w-8 h-8 " />
        </div>
        <div className="stat-value text-primary">{data.ongoing}</div>
        <div className="stat-title">On-going bookings</div>
        <div className="stat-desc">Currently</div>
      </div>
    </div>
  )
}