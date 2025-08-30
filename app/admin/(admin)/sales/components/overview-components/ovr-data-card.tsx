'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { useEffect, useState } from "react"
import { useFilter } from "../provider"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import ExtraWrapperProvider from "./extra-wrapper"
import { months } from "@/lib/utils/month-filter-utils"

type CustomClass = {
  headerclass: string,
  valueclass: string,
  footerclass: string,
}

function formatNumber(value: number): string {
  const suffixes = ["", "K", "M", "B", "T"]; // Add more suffixes as needed for larger numbers
  let suffixIndex = 0;
  let scaledValue = value;

  while (scaledValue >= 1000 && suffixIndex < suffixes.length - 1) {
    scaledValue /= 1000;
    suffixIndex++;
  }

  const formattedValue = scaledValue.toFixed(1); // Adjust decimal places as needed

  return formattedValue + suffixes[suffixIndex];
}

export default function OverviewDataCard({
  header,
  position = "start",
  method,
  extra = <></>,
  money,
  percent,
  classNames,
  scale,
}: {
  header: string,
  position: string,
  footer: string,
  method: any,
  extra?: React.ReactNode,
  money?: boolean,
  percent?: boolean,
  classNames?: CustomClass,
  scale?: boolean
}) {

  const { filter } = useFilter()

  // states
  const [state, setState] = useState<JSX.Element | null>(
    <div className="space-y-2 p-4">
      <Skeleton className="w-24 h-4 bg-gray-200" />
      <Skeleton className="w-32 h-6 bg-gray-300" />
    </div>
  )

  // values
  const [value, setValue] = useState<number>(0)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await method(filter)

      if (response.status == 500) {
        setState(
          <div className="stat relative">
            {
              position == "start" && (
                <div className="stat-value text-red-500 text-2xl">&#8369; 0</div>
              )
            }
            <div className="stat-title text-sm">{header}</div>
            {
              position == "center" && (
                <div className="stat-value text-red-500 text-2xl">&#8369; 0</div>
              )
            }
            <div className="stat-desc text-primary">Unable to get the data</div>
          </div>
        )
        return
      }

      setValue(response.data)

      if (extra) {
        setData(response.extra)
      }

      setState(null)
    }

    setState(
      <div className="space-y-2 p-4">
        <Skeleton className="w-24 h-4 bg-gray-200" />
        <Skeleton className="w-32 h-6 bg-gray-300" />
      </div>
    )
    fetchData()
  }, [filter])

  return (
    <>
      <ExtraWrapperProvider data={data}>
        {
          state ? (
            <>
              {state}
            </>
          ) : (
            <div className="stat relative flex flex-col">
              {extra}

              <div
                className={clsx(cn("stat-value text-black", classNames?.valueclass), {
                  "order-1": position === "start",
                  "order-2": position === "center",
                  "text-red-500": percent && value < 0,
                  "text-green-500": percent && value > 0,
                  "text-2xl": !classNames?.valueclass
                })}
              >
                {money ? "₱" : ""} {scale ? formatNumber(parseFloat(value.toFixed(2))) : parseFloat(value.toFixed(2)).toLocaleString()} {percent ? "%" : ""}
              </div>
              <div
                className={clsx(cn("stat-title", classNames?.headerclass), {
                  "order-2": position === "start",
                  "order-1": position === "center",
                  "text-sm": !classNames?.headerclass,
                })}
              >
                {header}
              </div>
              <div className={cn("stat-desc text-primary order-3", classNames?.footerclass)}>{
                filter.get.start.getMonth() == new Date().getMonth() && filter.get.start.getFullYear() == new Date().getFullYear() ? (
                  "This month"
                ) : (
                  <>{months[filter.get.start.getMonth()] + ", " + filter.get.start.getFullYear()}</>
                )
              }</div>
            </div>
          )
        }
      </ExtraWrapperProvider>
    </>
  )
}