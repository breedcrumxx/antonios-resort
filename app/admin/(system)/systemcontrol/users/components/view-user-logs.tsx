'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import { ArrowDownNarrowWide, ArrowUpWideNarrow } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import CalendarFilter from "../../components/date-filter"
import { LogsColumns } from "./logs-columns"

export default function ViewUserLogsTable({ userid }: { userid: string }) {

  // states
  const [page, setPage] = useState<number>(1)
  const [enableRange, setEnableRange] = useState<boolean>(false)
  const [sort, setSort] = useState<string>("desc")
  const [queryLink, setQueryLink] = useState<string>(`/users/logs/${userid}?page=${page}&sort=${sort}`)

  // values
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")

  const sorted = useDebounce(sort, 300)

  useEffect(() => {
    setQueryLink(`/users/logs/${userid}?page=${page}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }&sort=${sorted}`)
  }, [dateQuery, sorted, page])

  const setDateFilter = () => {
    if (date && date instanceof Date) {
      const [startTimeHours, startTimeMinutes] = startTime.split(":")
      const [endTimeHours, endTimeMinutes] = endTime.split(":")
      const from = new Date(date.setHours(parseInt(startTimeHours), parseInt(startTimeMinutes), 0, 0))
      const to = new Date(date.setHours(parseInt(endTimeHours), parseInt(endTimeMinutes), 59, 999))

      setDateQuery({ from, to })
      return
    }

    if (date && date.from instanceof Date && date.to instanceof Date) {
      const from = new Date(new Date(date.from).setHours(0, 0, 0, 0))
      const to = new Date(new Date(date.to).setHours(23, 59, 59, 999))
      setDateQuery({ from, to })
      return
    }
  }

  const calendarProps = {
    date,
    enableRange,
    startTime,
    endTime,
    setDateQuery,
    setDate,
    setStartTime,
    setEndTime,
    setEnableRange,
    setDateFilter,
  }

  const filterComponent = (
    <>
      <Button variant={"ghost"} className="capitalize" onClick={() => setSort((prev) => prev == "desc" ? "asc" : "desc")}>
        {sort}
        {
          sort == "desc" ? (
            <ArrowUpWideNarrow className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownNarrowWide className="ml-2 h-4 w-4" />
          )
        }
      </Button>
      <CalendarFilter {...calendarProps} />
    </>
  )

  return (
    <ReloadProvider>
      <PaginationProvider changepage={setPage}>
        <TableWrapper
          api={queryLink}
          columns={LogsColumns}
          searchRef={"userid"}
          disableadd
          disablesearch
          filtercomponent={filterComponent}
        />
      </PaginationProvider>
    </ReloadProvider>
  )
}