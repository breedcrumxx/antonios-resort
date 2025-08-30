"use client"

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
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts"
import { getAgeDistributionData } from "../callback-actions/age-distribution-data"
import LoadingCurtain from "./loading-curtain"

const chartData = [
  { id: 1, month: "January", senior: 186, adult: 80, kids: 80 },
]

const radialData = [
  { name: "chrome", client: 275, fill: "var(--color-chrome)" }
]

type BarDataType = typeof chartData
type RadialDataType = typeof radialData

const barChartConfig = {
  senior: {
    label: "Seniors/PWDs",
  },
  adult: {
    label: "Adults",
  },
  kids: {
    label: "Teens/Kids",
  },
} satisfies ChartConfig

const radialChartConfig = {
  client: {
    label: "Clients",
  },
  senior: {
    label: "Seniors/PWDs",
  },
  adult: {
    label: "Adults",
  },
  kids: {
    label: "Teens/Kids",
  },
} satisfies ChartConfig

export default function MonthlyAgeDistribution() {

  // states
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [ageDistributionData, setAgeDistributionData] = useState<BarDataType>([])
  const [yearDistribution, setYearDistribution] = useState<RadialDataType>([])

  useEffect(() => {
    const fetchData = async () => {

      const response = await getAgeDistributionData(year)
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }
      const arraged = response.data.monthlydistributions
        .sort((a, b) => a.id - b.id) // sort the data to asc
        .map((item) => {
          return { id: item.id, month: months[item.id], adult: item.adults, senior: item.senior, kids: item.teens }
        })

      const radialData = [
        { name: "adult", client: response.data.totaladults, fill: "#f2bb1d" },
        { name: "senior", client: response.data.totalsenior, fill: "#313d6b" },
        { name: "kids", client: response.data.totalteens, fill: "#7aa7cb" },
      ]

      setYearDistribution(radialData)
      setAgeDistributionData(arraged)
    }

    setLoading(true)
    fetchData()

  }, [year])

  return (
    <div className="col-span-4 row-span-5 grid grid-cols-4 p-4 gap-4 hover:bg-muted/30 relative">

      <LoadingCurtain
        open={loading || error}
        custom={<>
          {
            loading ? (
              <p>Picking up scattered data...</p>
            ) : error && (
              <p className="text-red-500">An error occured!</p>
            )
          }
        </>}
      />

      <div className="absolute z-[49] right-4 top-4 flex justify-end">
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

      <div className="col-span-1 flex flex-col gap-2">
        <h1 className="font-bold text-sm text-center">This year age distribution</h1>
        <div className="flex-grow overflow-hidden">
          <ChartContainer
            config={radialChartConfig}
            className="h-full w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={yearDistribution}
                dataKey="client"
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
                            {(yearDistribution.reduce((a, b) => a + b.client, 0)).toLocaleString()}
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
        </div>
      </div>

      <div className="col-span-3 flex flex-col gap-2">
        <h1 className="font-bold text-sm text-center">Montly age distribution</h1>
        <div className="flex-grow overflow-hidden">
          <ChartContainer
            className="aspect-auto h-full w-full"
            config={barChartConfig}>
            <BarChart accessibilityLayer data={ageDistributionData}>
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

              <Bar dataKey="senior" fill="#f2bb1d" radius={4} />
              <Bar dataKey="adult" fill="#313d6b" radius={4} />
              <Bar dataKey="kids" fill="#7aa7cb" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
