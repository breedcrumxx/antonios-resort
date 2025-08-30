'use client'

import CalendarFilter from "@/app/admin/(system)/systemcontrol/components/date-filter"
import SortingButton from "@/app/admin/(system)/systemcontrol/components/sorting-btn"
import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import { Check, ChevronDown, CircleDotDashed, CircleOff, Columns2, RotateCcw, TrendingUp, X, LucideRotateCw, CircleSlash } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { columns } from "../../components/user-booking-columns"
import React from "react"
import { DashIcon } from "@radix-ui/react-icons"

const statuses = [
  { title: "All", icon: <Columns2 className="mr-2 h-4 w-4" /> },
  { title: "Waiting", icon: <LucideRotateCw className="mr-2 h-4 w-4 text-orange-500" /> },
  { title: "Ongoing", icon: <TrendingUp className="mr-2 h-4 w-4" /> },
  { title: "Approved", icon: <Check className="mr-2 h-4 w-4 text-green-500" /> },
  { title: "Completed", icon: <Check className="mr-2 h-4 w-4 text-blue-500" /> },
  { title: "Pending", icon: <CircleDotDashed className="mr-2 h-4 w-4 text-yellow-500" /> },
  { title: "Cancelled", icon: <CircleOff className="mr-2 h-4 w-4 text-red-500" /> },
  { title: "Rejected", icon: <X className="mr-2 h-4 w-4 text-red-500" /> },
  { title: "Voided", icon: <CircleSlash className="mr-2 h-4 w-4 " /> },
  { title: "No-show", icon: <DashIcon className="mr-2 h-4 w-4" /> },
]

export default function TableTop({ user }: { user: UserSession }) {

  // states 
  const [page, setPage] = useState<number>(1)
  const [sort, setSort] = useState<string>("desc")
  const [status, setStatus] = useState<string>("All")
  const [enableRange, setEnableRange] = useState<boolean>(false)

  // values
  const [searchValue, setSearchValue] = useState<string>("")
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")

  const [queryLink, setQueryLink] = useState<string>(`/bookings/status/${status}/${user.id}?page=1&sort=${sort}`)

  const debounce = useDebounce(searchValue, 500)

  useEffect(() => {
    setQueryLink(`/bookings/status/${status}/${user.id}?page=1&sort=${sort}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""}${debounce.length > 0 ? `&searchvalue=${encodeURIComponent(debounce)}` : ""}`)
  }, [page, status, dateQuery, debounce, sort])

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Status {status} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {
            statuses.map((item, i) => (
              <DropdownMenuItem onClick={() => setStatus(item.title)} key={i}>
                {item.icon}
                {item.title}
              </DropdownMenuItem>
            ))
          }
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatus("All")} className="text-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CalendarFilter {...calendarProps} />
      <SortingButton sort={sort} setSort={setSort} />
    </>
  )

  const searchfilterComponent = (
    <>
      <Input
        placeholder={`Search booking ID...`}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        className="max-w-[300px]"
      />
    </>
  )

  return (
    <>
      <ReloadProvider>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={columns}
            hidden={{ type: false, class: false, timestart: false }}
            searchRef={"bookingid"}
            disableadd
            disablesearch
            filtercomponent={filterComponent}
            searchfiltercomponent={searchfilterComponent}
          />
        </PaginationProvider>
      </ReloadProvider>
    </>
  )
}