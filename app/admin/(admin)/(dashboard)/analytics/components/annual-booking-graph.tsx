"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { months } from "@/lib/utils/month-filter-utils"
import { useEffect, useState } from "react"
import { getBarGraphData } from "../callback-actions/bar-graph-data"
import LoadingCurtain from "./loading-curtain"

export const description = "A multiple bar chart"

const chartData = [
  { id: 1, month: "January", rejected: 186, completed: 80, cancelled: 80 },
]

type ChartDataType = typeof chartData

const chartConfig = {
  rejected: {
    label: "Rejected",
  },
  cancelled: {
    label: "Cancelled",
  },
  completed: {
    label: "Completed",
  },
} satisfies ChartConfig

export default function AnnualBookingGraph() {

  // states
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [bargraphdata, setBargraphdata] = useState<ChartDataType>([])
  const [bargraphextra, setBargraphextra] = useState<{
    monthavg: number;
    avgcompleted: number;
    topmonth: string;
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {

      const response = await getBarGraphData(year)
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }

      setBargraphdata(response.data?.map((item) => ({ month: months[item.id], ...item })).sort((a, b) => a.id - b.id) as ChartDataType)
      setBargraphextra(response.extra || null)
    }

    setLoading(true)
    fetchData()

  }, [year])

  return (
    <div className="col-span-3 row-span-5 flex gap-2 p-4 shadow rounded-sm hover:bg-muted/30 relative">

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

      <div className="absolute z-[49] right-4 flex justify-end">
        <Select value={year.toString()} onValueChange={(e) => setYear(parseInt(e))}>
          <SelectTrigger className="w-max">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent align="end">
            {
              Array.from({ length: 5 }, (_, n) => new Date().getFullYear() - n).map((item, i) => (
                <SelectItem value={`${item}`} key={`${i}`}>{item}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      <div className="w-1/8 whitespace-wrap">
        <h1 className="font-semibold text-xl">{bargraphextra?.monthavg?.toFixed(2) || 0}</h1>
        <h1 className="text-xs text-gray-500">Average bookings <br /> per month</h1>
        <br />
        <h1 className="font-semibold text-xl">{bargraphextra?.avgcompleted.toFixed(2) || 0}</h1>
        <h1 className="text-xs text-gray-500">Completed bookings</h1>
        <br />
        <h1 className="font-semibold text-xl">{bargraphextra?.topmonth || 0}</h1>
        <h1 className="text-xs text-gray-500">Month with most booking</h1>
      </div>
      <div className="flex-grow overflow-hidden p-2">
        <ChartContainer
          className="aspect-auto h-full w-full"
          config={chartConfig}>
          <BarChart accessibilityLayer data={bargraphdata}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey="rejected" fill="#ef4444" radius={4} />
            <Bar dataKey="cancelled" fill="#f97316" radius={4} />
            <Bar dataKey="completed" fill="#3b82f6" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
