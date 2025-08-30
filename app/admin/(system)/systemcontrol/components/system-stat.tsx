'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"
import { getLastMaintenance } from "@/lib/actions/system-actions/system-maintenance"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { format } from "date-fns"
import { TrafficCone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function SystemStat() {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<z.infer<typeof maintenanceschema> | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getLastMaintenance()
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }

      setData(response.data as z.infer<typeof maintenanceschema> | null)

    }

    fetchData()
  }, [])

  return (
    <div className="col-span-2 stats shadow bg-white flex-grow relative cursor-pointer hover:bg-muted/40" onClick={() => router.push("/admin/systemcontrol/performance")}>
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
      <div className="stat">
        <div className="stat-figure text-primary">
          <TrafficCone className="h-8 w-8 text-orange-500" />
        </div>
        <div className="stat-title">Last maintenance</div>
        <div className="text-primary font-semibold">{data ? format(data.start, "MMMM, dd yyyy h:mm a") : "No maintenance"}</div>
        <div className="stat-desc text-primary">{data && `Lasted for ${data.duration} hr/s`}</div>
      </div>
    </div>
  )
}