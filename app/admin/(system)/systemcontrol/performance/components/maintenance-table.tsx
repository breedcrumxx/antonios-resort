'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { format } from "date-fns"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown, MoreHorizontal, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import z from 'zod'
import CalendarFilter from "../../components/date-filter"
import AbortMaintenance from "./abort-maintenance"
import MaintenanceControls from "./maintenance-controls"
import ViewFullMaintenanceDetails from "./view-full-maintenance"

export const MaintanceColumns: ColumnDef<z.infer<typeof maintenanceschema>>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Label",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{row.original.title}</div>
    ),
  },
  {
    id: "coverage",
    accessorKey: "coverage",
    header: "Coverage",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs capitalize">{row.original.coverage}</div>
    ),
  },
  {
    id: "duration",
    accessorKey: "duration",
    header: "Duration",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{row.original.duration} hr/s</div>
    ),
  },
  {
    id: "start",
    accessorKey: "start",
    header: "Maintenance start",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-xs">{format(row.original.start, "PPP, h:mm a")}</div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => (
      <div className={clsx("text-xs", {
        'text-red-500': row.original.status == "Aborted",
        'text-green-500': row.original.status == "On-process",
        'text-orange-500': row.original.status == "Pending",
        'text-blue-500': row.original.status == "Completed",
      })}>{row.original.status}</div>
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
              {row.original.status == "Pending" && (<DropdownMenuItem className="text-red-500" onClick={() => setOperation("abort")}>Abort</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
            <DialogContent className={clsx("", { "max-w-[60vw] max-h-[60vh] min-w-[60vw] min-h-[60vh] flex flex-col": operation == "view" })}>
              {
                operation == "view" ? (
                  <ViewFullMaintenanceDetails
                    data={row.original}
                    close={() => setOperation("")}
                  />
                ) : (
                  <AbortMaintenance
                    data={row.original}
                    close={() => setOperation("")} />
                )
              }
            </DialogContent>
          </Dialog>
        </>
      )
    },
  }
]

export default function TableTop() {

  // states
  const [addSchedule, setAddSchedule] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [enableRange, setEnableRange] = useState<boolean>(false)
  const [sort, setSort] = useState<string>("desc")
  const [status, setStatus] = useState<string>("All")
  const [queryLink, setQueryLink] = useState<string>(`/system/maintenance?page=${page}&sort=${sort}&status=All`)

  // values
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")
  const [searchValue, setSearchValue] = useState<string>("")

  const searchQuery = useDebounce(searchValue, 500)

  useEffect(() => {
    setQueryLink(`/system/maintenance?page=${page}&sort=${sort}&limit=10${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }${searchQuery.length > 0 ? `&searchValue=${searchQuery}` : ""
      }${status.length > 0 ? `&status=${status}` : ""}`)
  }, [page, dateQuery, sort, searchQuery, status])

  const searchfilterComponent = (
    <>
      <Input placeholder={'Maintenance label...'} className="max-w-[300px] capitalize" onChange={(e) => setSearchValue(e.target.value)} />
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
            "text-green-500": status == "Completed",
            "text-orange-500": status == "On-process",
            "text-red-500": status == "Pending",
            "text-blue-500": status == "Aborted",
          })}>
            Status {status} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={status == "All"}
            onCheckedChange={(e: boolean) => e && setStatus("All")}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={status == "Completed"}
            onCheckedChange={(e: boolean) => e && setStatus("Completed")}
            className="text-blue-500"
          >
            Completed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={status == "On-process"}
            onCheckedChange={(e: boolean) => e && setStatus("On-process")}
            className="text-green-500"
          >
            On-process
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={status == "Pending"}
            onCheckedChange={(e: boolean) => e && setStatus("Pending")}
            className="text-orange-500"
          >
            Pending
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={status == "Aborted"}
            onCheckedChange={(e: boolean) => e && setStatus("Aborted")}
            className="text-red-500"
          >
            Aborted
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => {
            setDate(undefined) // reset the date
            setDateQuery(undefined) // reset query date
            setStartTime("00:00") // reset the date
            setEndTime("23:59") // reset the date
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
            columns={MaintanceColumns}
            searchRef={"code"}
            // disableadd
            callToAdd={() => setAddSchedule(true)}
            disablesearch
            filtercomponent={filterComponent}
            searchfiltercomponent={searchfilterComponent}
          />
        </PaginationProvider>
        <Dialog open={addSchedule} onOpenChange={(e) => setAddSchedule(e)}>
          <DialogContent className="min-h-[70vh] max-h-[70vh] min-w-[60vw] max-w-[60vw] flex flex-col">
            <DialogHeader>
              <DialogTitle>Deploy a maintenance</DialogTitle>
            </DialogHeader>
            <div className="flex-grow px-4 overflow-y-scroll scroll">
              <MaintenanceControls close={() => setAddSchedule(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </ReloadProvider>
    </>
  )
}