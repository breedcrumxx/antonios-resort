'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { Separator } from "@/app/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet"
import ReloadProvider from "@/app/providers/reloader"
import { GithubIssue } from "@/lib/interfaces"
import { useDebounce } from "@/lib/utils/debounce"
import clsx from "clsx"
import { formatDistanceToNow } from "date-fns"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ListFilter, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import CalendarFilter from "../../components/date-filter"
import CaseContainer from "./case-container"
import CaseViewer from "./case-viewer"
import { ReportsColumn } from "./reports-columns"

export default function ViewErrorReportsTable() {

  // states
  const [page, setPage] = useState<number>(1)
  const [enableRange, setEnableRange] = useState<boolean>(false)
  const [sort, setSort] = useState<string>("desc")
  const [queryLink, setQueryLink] = useState<string>(`/system/reportlogs?page=${page}&sort=${sort}`)
  const [searchValue, setSearchValue] = useState<string>("")
  const [searchBy, setSearchBy] = useState<string>("issueid")

  // values
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")
  const [selectedCase, setSelectedCase] = useState<GithubIssue | null>(null)

  const sorted = useDebounce(sort, 300)
  const search = useDebounce(searchValue, 300)

  useEffect(() => {
    setQueryLink(`/system/reportlogs?page=${page}&sort=${sort}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }${search.length > 0 ? `&searchValue=${search}&searchBy=${searchBy}` : ""}`)
  }, [dateQuery, sorted, page, search])

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

  const searchComponent = (
    <>
      <Input placeholder={`${searchBy == "issueid" ? "Issue ID" : "Code"}...`} className="max-w-[300px]" onChange={(e) => setSearchValue(e.target.value)} />
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
            <DropdownMenuRadioItem value="issueid">Issue ID</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="code">Code</DropdownMenuRadioItem>
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

  const filterComponent = (
    <>
      <CalendarFilter {...calendarProps} />
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
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"outline"} className="capitalize">
            Cases
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0 flex flex-col overflow-hidden">
          <SheetHeader className="p-4">
            <SheetTitle>Cases</SheetTitle>
          </SheetHeader>
          <CaseContainer selectcase={setSelectedCase} />
        </SheetContent>
      </Sheet>
    </>
  )

  return (
    <>
      <ReloadProvider>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={ReportsColumn}
            searchRef={"issueid"}
            disableadd
            disablesearch
            searchfiltercomponent={searchComponent}
            filtercomponent={filterComponent}
          />
        </PaginationProvider>
      </ReloadProvider>
      <Dialog open={selectedCase != null} onOpenChange={(e) => setSelectedCase(null)}>
        <DialogContent className="min-w-[80vw] min-h-[80vh] max-w-[80vw] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedCase?.title} <span className="font-normal">Issue #{selectedCase?.number}</span></DialogTitle>
            <DialogDescription><Badge className={clsx("", {
              "bg-green-500": selectedCase?.state == "open",
              "bg-red-500": selectedCase?.state == "close",
            })}>{selectedCase?.state}</Badge> - Opened this issue {formatDistanceToNow(selectedCase?.created_at || new Date(), { addSuffix: true })} - {selectedCase?.comments} comments</DialogDescription>
          </DialogHeader>
          <Separator />
          {
            selectedCase && (
              <CaseViewer data={selectedCase} />
            )
          }
        </DialogContent>
      </Dialog>
    </>
  )
}