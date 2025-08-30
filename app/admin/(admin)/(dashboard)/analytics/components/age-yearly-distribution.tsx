'use client'

import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/app/components/ui/chart"
import { useEffect, useState } from "react"
import { getUserDonutData } from "../callback-actions/user-data"
import LoadingCurtain from "./loading-curtain"

export const description = "A donut chart with text"

const chartData = [
  { name: "chrome", users: 275, fill: "var(--color-chrome)" },
]

type ChartDataType = typeof chartData

const chartConfig = {
  users: {
    label: "Users",
  },
  new: {
    label: "New",
  },
  active: {
    label: "Active",
  },
  inactive: {
    label: "Inactive",
  },
} satisfies ChartConfig

export default function AgeYearlyDistribution() {
  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [donutdata, setDonutdata] = useState<ChartDataType>([])
  const [totalUsers, setTotalUsers] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserDonutData()
      setLoading(false)

      if (response.status == 500) return

      const chart = [
        { name: "new", users: response.data.newusers, fill: "#eab308" },
        { name: "active", users: response.data.active - response.data.newusers, fill: "#22c55e" },
        { name: "inactive", users: response.data.inactive, fill: "#78716c" },
      ]

      setDonutdata(chart)
      setTotalUsers(response.data.active + response.data.inactive)
    }

    setLoading(true)
    fetchData()

  }, [])


  return (
    <Card className="col-span-1 row-span-5 flex flex-col border-none relative">
      <LoadingCurtain open={loading} />
      <CardHeader className="items-center pb-0">
        <CardTitle>User base</CardTitle>
        <CardDescription>Latest</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={donutdata}
              dataKey="users"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {(totalUsers).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
