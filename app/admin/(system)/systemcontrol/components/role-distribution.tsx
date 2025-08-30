"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { useEffect, useState } from "react"
import { getRolesDistribution } from "@/lib/actions/dashboard-calls/system-dashboard/system-roles"
import LoadingCurtain from "@/app/admin/(admin)/(dashboard)/analytics/components/loading-curtain"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const colors = [
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#d946ef",
  "#f43f5e"
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function RoleDistribution() {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<{ role: string, count: number, fill: string }[]>([])


  useEffect(() => {
    const fetchData = async () => {
      const response = await getRolesDistribution()
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }

      setData(response.data.map((item, i) => ({ ...item, fill: colors[i] })))
    }

    fetchData()
  }, [])

  return (
    <div className="col-span-1 row-span-5 flex flex-col p-4 shadow rounded-lg relative">
      <h1 className="font-semibold">Role distribution</h1>
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
          className="aspect-auto w-full h-full"
          config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="role"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
