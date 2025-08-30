"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/app/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { months } from "@/lib/utils/month-filter-utils";
import { useEffect, useState } from "react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { getLineGraphData } from "../callback-actions/line-graph-data";
import LoadingCurtain from "./loading-curtain";
import { Label } from "@/app/components/ui/label";

const colors = [
  { stroke: "#3b82f6", fill: "#1d4ed8" },
  { stroke: "#22c55e", fill: "#15803d" },
  { stroke: "#f43f5e", fill: "#be123c" },
  { stroke: "#f59e0b", fill: "#b45309" },
  { stroke: "#a855f7", fill: "#7e22ce" },
]

function createObject(num: number): { [key: string]: { label: string, stroke: string, fill: string } } {
  const result: { [key: string]: { label: string, stroke: string, fill: string } } = {};
  const currentYear = new Date().getFullYear(); // Get current year

  // Define the labels for each position
  const keys = ['first', 'second', 'third', 'fourth', 'fifth'];

  for (let i = 0; i < num; i++) {
    result[keys[i]] = {
      label: (currentYear - i).toString(), // Set label starting with current year and decrement
      stroke: colors[i].stroke,
      fill: colors[i].fill,
    };
  }

  return result;
}

const chartData = [
  { month: "January", first: 186, second: 80, third: 0, fourth: 0, fifth: 0 },
]

type ChartDataType = typeof chartData
type ChartConfigValueType = { label: string, stroke: string, fill: string }

export default function RevenueLineGraph() {

  // states 
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [chartConfig, setChartConfig] = useState<any>({})

  // values
  const [linegrapdata, setLinegraphdata] = useState<ChartDataType>([])
  const [span, setSpan] = useState<number>(0)

  useEffect(() => {

    setChartConfig(createObject(span + 1))

    const fetchData = async () => {

      const response = await getLineGraphData(span)
      setLoading(false)

      if (response.status == 500 || !response.data) {
        setError(true)
        return
      }

      const sorteditems = response.data.sort((a, b) => b.year - a.year)

      let temp: ChartDataType = months.map((item) => ({ month: item, first: 0, second: 0, third: 0, fourth: 0, fifth: 0 }));

      // build the ChartData structure
      sorteditems.map((item, i) => {
        const sorteddata = item.monthlydata.sort((a, b) => a.id - b.id)
        temp = temp.map((y, pos) => {
          if (i == 0) return { ...y, first: sorteddata[pos].earnings }
          else if (i == 1) return { ...y, second: sorteddata[pos].earnings }
          else if (i == 2) return { ...y, third: sorteddata[pos].earnings }
          else if (i == 3) return { ...y, fourth: sorteddata[pos].earnings }
          else return { ...y, fifth: sorteddata[pos].earnings }
        })
      })

      setLinegraphdata(temp)
    }

    setLoading(true)
    fetchData()

  }, [span])

  return (
    <div className="col-span-4 row-span-6 flex flex-col space-y-2 p-10 shadow rounded-sm hover:bg-muted/30 relative">
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

      <div className="absolute z-100 top-4 right-4 flex justify-end">
        <Select
          value={span.toString()}
          onValueChange={(e) => {
            setSpan(parseInt(e))
          }}
        >
          <SelectTrigger className="w-max">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="0" key={"0"}>Current year</SelectItem>
              <SelectItem value="2" key={"2"}>3 years</SelectItem>
              <SelectItem value="4" key={"4"}>5 years</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Label>Annual Revenue</Label>
      <ChartContainer
        className="aspect-auto w-full h-full"
        config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={linegrapdata}
          margin={{
            top: 20,
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
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          {
            Object.entries(chartConfig).map((item, i) => {
              const [key, value] = item as [key: string, value: ChartConfigValueType]
              return (
                <Line
                  dataKey={key}
                  stroke={value.stroke as string}
                  strokeWidth={2}
                  dot={{
                    fill: value.fill as string,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  key={i}
                >
                  {
                    Object.entries(chartConfig).length == 1 && (
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    )
                  }
                </Line>
              )
            })
          }
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
