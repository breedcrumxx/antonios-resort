'use client'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useEffect, useState } from "react"
import { getUserEngagementData } from "../callback-actions/user-engagement-data"
import LoadingCurtain from "./loading-curtain"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { months } from "@/lib/utils/month-filter-utils"
import { Label } from "@/app/components/ui/label"

const chartData = [
  { month: "January", new_user: 186, active: 80, inactive: 130 },
]

type ChartDataType = typeof chartData

export default function UserEngagementChart() {

  // states
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(true)

  // values
  const [engagementData, setEngagementData] = useState<ChartDataType>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserEngagementData(year)
      setLoading(false)
      if (response.status == 500 || !response.data) {
        setError(true)
        return
      }

      const sorted = response.data.sort((a, b) => a.id - b.id)

      const temp = sorted.map((item, i) => {
        return { month: months[i], new_user: item.newusers, active: item.activeusers, inactive: item.inactiveusers }
      })

      setEngagementData(temp)
    }

    setLoading(true)
    fetchData()

  }, [year])

  const chartConfig = {
    new_user: {
      label: "New user",
      color: "hsl(var(--chart-1))",
    },
    active: {
      label: "Active",
      color: "hsl(var(--chart-2))",
    },
    inactive: {
      label: "Inactive",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  return (
    <div className="col-span-2 row-span-5 flex flex-col space-y-2 p-4 shadow rounded-sm hover:bg-muted/30 relative">
      <LoadingCurtain
        open={loading}
        custom={<>
          {
            loading ? (
              <p>Picking up scattered data...</p>
            ) : error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>
        }
      />
      <div className="absolute z-100 right-4 flex justify-end">
        <Select value={year.toString()} onValueChange={(e) => setYear(parseInt(e))}>
          <SelectTrigger className="w-max">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {
              Array.from({ length: 5 }, (_, n) => new Date().getFullYear() - n).map((item, i) => (
                <SelectItem value={`${item}`} key={`${i}`}>{item}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      <Label>User activity</Label>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={engagementData}>
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
          <Bar dataKey="new_user" fill="#eab308" radius={4} />
          <Bar dataKey="active" fill="#22c55e" radius={4} />
          <Bar dataKey="inactive" fill="#78716c" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}