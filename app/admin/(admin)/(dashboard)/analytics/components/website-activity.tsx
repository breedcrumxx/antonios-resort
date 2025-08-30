"use client"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { Label } from "@/app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { months } from "@/lib/utils/month-filter-utils"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { getWebsitePopularity } from "../callback-actions/user-engagement-data"
import LoadingCurtain from "./loading-curtain"

export const description = "An area chart with icons"

const chartData = [
  { month: "January", visits: 186, bookings: 80 },
]

type ChartDataType = typeof chartData

const chartConfig = {
  visits: {
    label: "Visit",
  },
  bookings: {
    label: "Bookings",
  },
} satisfies ChartConfig

export function WebiteActivity() {

  // states
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [engagementData, setEngagementData] = useState<ChartDataType>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getWebsitePopularity(year)
      setLoading(false)

      if (response.status == 500 || !response.data) {
        setError(true)
        return
      }

      const sorted = response.data.sort((a, b) => a.id - b.id)

      const temp = sorted.map((item, i) => {
        return { month: months[i], visits: item.visits, bookings: item.bookings }
      })
      setEngagementData(temp)
    }

    setLoading(true)
    fetchData()

  }, [year])

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
      <Label className="mb-2">Bookings over Visits</Label>
      <ChartContainer
        config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={engagementData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="visits"
            fill="#4ade80"
            fillOpacity={0.4}
            stroke="#16a34a"
            stackId="a"
          />
          <Area
            dataKey="bookings"
            fill="#38bdf8"
            fillOpacity={0.4}
            stroke="#0284c7"
            stackId="b"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
