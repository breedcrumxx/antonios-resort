'use client'

import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart";
import { getSystemErrorData } from "@/lib/actions/dashboard-calls/system-dashboard/system-error";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "January", get: 186, put: 80, post: 0, deletem: 0 },
]

type ChartDataType = typeof chartData

const chartConfig = {
  get: {
    label: "GET",
  },
  post: {
    label: "POST",
  },
  put: {
    label: "PUT",
  },
  deletem: {
    label: "DELETE",
  },
} satisfies ChartConfig

export default function SystemErrorDistribution() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<ChartDataType>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSystemErrorData()
      setLoading(false)
      if (response.status == 500) {
        setError(true)
        return
      }

      const temp = response.data.sort((a, b) => a.id - b.id).map((item) => {
        const { id, ...rest } = item
        return rest
      })

      setData(temp)
    }

    fetchData()
  }, [])

  return (
    <div className="col-span-2 row-span-5 flex flex-col p-4 shadow rounded-lg relative">
      <h1 className="font-semibold">System errors</h1>
      <LoadingCurtain
        custom={<>
          {
            error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>}
        open={loading || error} />

      <div className="flex-grow overflow-hidden p-2">
        <ChartContainer
          className="aspect-auto h-full w-full"
          config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="get" fill="#22c55e" radius={4} />
            <Bar dataKey="put" fill="#3b82f6" radius={4} />
            <Bar dataKey="post" fill="#f97316" radius={4} />
            <Bar dataKey="deletem" fill="#ef4444" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}