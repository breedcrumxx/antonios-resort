'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import { systemerrorlog } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { format } from "date-fns"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown, Gauge, ListFilter, Mail, MessageSquare, MoreHorizontal, PlusCircle, RotateCcw, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import z from 'zod'
import CalendarFilter from "../../components/date-filter"
import ViewErrorDetails from "./view-error-details"

export const ErrorLogsColumns: ColumnDef<z.infer<typeof systemerrorlog>>[] = [
  {
    id: "code",
    accessorKey: "code",
    header: "Error",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{row.original.code}</div>
    ),
  },
  {
    id: "method",
    accessorKey: "method",
    header: "Request",
    enableHiding: false,
    cell: ({ row }) => (
      <Badge className={clsx("", {
        "bg-green-500": row.original.requestmethod == "GET",
        "bg-orange-500": row.original.requestmethod == "POST",
        "bg-blue-500": row.original.requestmethod == "PUT",
        "bg-red-500": row.original.requestmethod == "DELETE",
      })}>{row.original.requestmethod}</Badge>
    ),
  },
  {
    id: "severity",
    accessorKey: "severity",
    header: "Severity",
    enableHiding: false,
    cell: ({ row }) => (
      <Badge className={clsx("", {
        "bg-red-500": row.original.severity == "Fatal",
        "bg-orange-500": row.original.severity == "Moderate",
        "bg-yellow-500": row.original.severity == "Minor",
      })}>{row.original.severity}</Badge>
    ),
  },
  {
    id: "useraction",
    accessorKey: "useraction",
    header: "Activity",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{row.original.useraction}</div>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{format(row.original.datetime, "PPP hh:mm a")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      const [operation, setOperation] = useState<string>("")

      return (
        <>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOperation("view")}>View details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
            <DialogContent className="max-w-[80vw] max-h-[90vh] min-w-[80vw] min-h-[90vh] flex flex-col">
              <ViewErrorDetails data={row.original} />
            </DialogContent>
          </Dialog>
        </>
      )
    },
  }
]

export default function TableTop() {

  // states
  const [page, setPage] = useState<number>(1)
  const [enableRange, setEnableRange] = useState<boolean>(false)
  const [sort, setSort] = useState<string>("desc")
  const [severity, setSeverity] = useState<string>("")
  const [method, setMethod] = useState<string>("All")
  const [queryLink, setQueryLink] = useState<string>(`/system/errorlogs?page=${page}&sort=${sort}&limit=10&method=${method}`)
  const [searchBy, setSearchBy] = useState<string>("error")

  // values
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")
  const [searchValue, setSearchValue] = useState<string>("")

  const searchQuery = useDebounce(searchValue, 500)

  useEffect(() => {
    setQueryLink(`/system/errorlogs?page=${page}&sort=${sort}&limit=10${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }${searchQuery.length > 0 ? `&searchBy=${searchBy}&searchValue=${searchQuery}` : ""
      }${method.length > 0 ? `&method=${method}` : ""}${severity.length > 0 ? `&severity=${severity}` : ""}`)
  }, [page, dateQuery, sort, searchQuery, method, severity])

  const searchfilterComponent = (
    <>
      <Input placeholder={`${searchBy}...`} className="max-w-[300px] capitalize" onChange={(e) => setSearchValue(e.target.value)} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ListFilter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Search by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={searchBy} onValueChange={(e) => setSearchBy(e)}>
            <DropdownMenuRadioItem value="error">Error name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="activity">Activity</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => {
            setSearchValue("")
            setSearchBy("email")
          }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={clsx("", {
            "text-green-500": method == "GET",
            "text-orange-500": method == "POST",
            "text-red-500": method == "DELETE",
            "text-blue-500": method == "PUT",
          })}>
            Filters {method} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Gauge className="mr-2 h-4 w-4" />
              <span>Severity</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={severity == "Fatal"}
                  onCheckedChange={(e: boolean) => e && setSeverity("Fatal")}
                  className="text-yellow-500"
                >
                  <span className="text-red-500">Fatal</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={severity == "Moderate"}
                  onCheckedChange={(e: boolean) => e && setSeverity("Moderate")}
                  className="text-yellow-500"
                >
                  <span className="text-orange-500">Moderate</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={severity == "Minor"}
                  onCheckedChange={(e: boolean) => e && setSeverity("Minor")}
                  className="text-yellow-500"
                >
                  <span className="text-yellow-500">Minor</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuLabel>Method</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={method == "All"}
            onCheckedChange={(e: boolean) => e && setMethod("All")}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={method == "GET"}
            onCheckedChange={(e: boolean) => e && setMethod("GET")}
            className="text-green-500"
          >
            GET
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={method == "POST"}
            onCheckedChange={(e: boolean) => e && setMethod("POST")}
            className="text-orange-500"
          >
            POST
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={method == "PUT"}
            onCheckedChange={(e: boolean) => e && setMethod("PUT")}
            className="text-blue-500"
          >
            PUT
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={method == "DELETE"}
            onCheckedChange={(e: boolean) => e && setMethod("DELETE")}
            className="text-red-500"
          >
            DELETE
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => {
            setDate(undefined) // reset the date
            setDateQuery(undefined) // reset query date
            setStartTime("00:00") // reset the date
            setEndTime("23:59") // reset the date
            setSeverity("")
            setMethod("All")
          }}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CalendarFilter {...calendarProps} />
      <Button variant={"outline"} className="capitalize" onClick={() => setSort((prev) => prev == "desc" ? "asc" : "desc")}>
        {
          sort == "desc" ? (
            <ArrowUpWideNarrow className="h-4 w-4" />
          ) : (
            <ArrowDownNarrowWide className="h-4 w-4" />
          )
        }
      </Button>
    </>
  )


  return (
    <>
      <ReloadProvider>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={ErrorLogsColumns}
            searchRef={"code"}
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