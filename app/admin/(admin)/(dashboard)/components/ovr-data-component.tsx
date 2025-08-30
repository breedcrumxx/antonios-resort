'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { formatString } from "@/lib/utils/string-formatter"
import { useEffect, useState } from "react"
import { useFilter } from "../../sales/components/provider"

export default function OvrDataComponent({ subtitle, method, set }: {
  subtitle: string,
  method: any,
  set?: string,
}) {

  const { filter } = useFilter()

  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [data, setData] = useState<number>(0)
  const [template, setTemplate] = useState<string>(subtitle)

  useEffect(() => {
    const fetchData = async () => {
      const response = await method(filter)

      if (response.status == 500) {
        return
      }

      setData(response.data as number)

      if (set && set.length > 0) {
        setTemplate(formatString(subtitle, response.extra as any))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <>
      {
        loading ? (
          <>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2 w-full" />
          </>
        ) : (
          <>
            <div className="stat-value text-2xl text-white">{data}</div>
            <div className="stat-desc">{template}</div>
          </>
        )
      }
    </>
  )
}