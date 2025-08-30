'use client'

import CancelBookingPolicy from "@/app/(home)/profile/components/cancel-booking-policy"
import CalendarFilter from "@/app/admin/(system)/systemcontrol/components/date-filter"
import FullBookingDetails from "@/app/admin/components/bookings-feature/full-booking-details"
import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { useToast } from "@/app/components/ui/use-toast"
import ReloadProvider, { useReload } from "@/app/providers/reloader"
import { approveBooking } from "@/lib/actions/booking-actions/approve-booking"
import { useDebounce } from "@/lib/utils/debounce"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { DashIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { message } from 'antd'
import clsx from "clsx"
import { format } from "date-fns"
import { Check, ChevronDown, CircleDotDashed, CircleOff, CircleSlash, Columns2, Copy, ListFilter, LucideRotateCw, MoreHorizontal, RotateCcw, TrendingUp, X } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import NoShowForm from "./no-show-form"
import RejectionForm from "./rejection-form"
import ZoomerContextProvider, { useZoom } from "./zoomer-provider"

export const bookingColumns: ColumnDef<BookingDataTable>[] = [
  {
    id: "bookingid",
    accessorKey: "bookingid",
    header: "Booking ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className=" max-w-[150px] flex items-center gap-1">
        <p className="truncate">{row.original.bookingid}</p>
        <Copy className="w-auto h-max cursor-pointer" onClick={() => {
          navigator.clipboard.writeText(row.getValue("bookingid"))
          message.success("Copied to clipboard!")
        }} />
      </div>
    ),
  },
  {
    id: "user",
    accessorKey: "user",
    header: "Guest",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.client.firstname + " " + row.original.client.lastname}</div>
    ),
  },
  {
    id: "package",
    accessorKey: "package",
    header: "Package",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.package.packagename}</div>
    ),
  },
  {
    id: "Reservation Date",
    accessorKey: "Reservation Date",
    header: "Reservation date",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div>{format(row.original.checkin, "MM/dd/yyyy hh:mmaaa")}</div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className={clsx("capitalize", {
          "text-yellow-500": row.getValue("status") == "Pending",
          "text-green-500": row.getValue("status") == "Approved",
          "text-blue-500": row.getValue("status") == "Completed",
          "text-red-500": ['Rejected', 'Cancelled'].some((item) => item == row.getValue("status"))
        })}>
          {row.getValue("status")}
        </div>
      )
    },
  },
]

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

export default function TableTop() {

  // states 
  const [page, setPage] = useState<number>(1)
  const [status, setStatus] = useState<string>("All")
  const [enableRange, setEnableRange] = useState<boolean>(false)

  // values
  const [searchBy, setSearchBy] = useState<string>("id")
  const [searchValue, setSearchValue] = useState<string>("")
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")

  const [queryLink, setQueryLink] = useState<string>(`/bookings/status/${status}?page=1`)

  const debounce = useDebounce(searchValue, 500)

  useEffect(() => {
    const command = sessionStorage.getItem("command")
    const filter = sessionStorage.getItem("filter")
    if (command) {
      setSearchValue(command)
      sessionStorage.removeItem("command")
    }
    if (filter) {
      setStatus(filter)
      sessionStorage.removeItem("filter")
    }
  }, [])

  useEffect(() => {
    setQueryLink(`/bookings/status/${status}?page=${page}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }${(debounce.length > 0 ? `&searchby=${searchBy}&searchvalue=${debounce}` : "")}`)
  }, [page, status, dateQuery, debounce])

  const resetFilter = () => {
    setQueryLink(`/bookings/status/All?page=${page}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }${(debounce.length > 0 ? `&searchby=${searchBy}&searchvalue=${debounce}` : "")}`)
    setSearchBy("id")
    setSearchValue("")
  }

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

  const action = {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      // context
      const { toast } = useToast()
      const { setReload } = useReload()
      const { zoom } = useZoom()

      // states 
      const [loading, setLoading] = useState<string>("")
      const [openModal, setOpenModal] = useState<boolean>(false)
      const [operation, setOperation] = useState<string>("")

      const handleOperation = (operation: string) => {
        setOpenModal(true)
        setOperation(operation)
      }

      const handleBookingApproval = async (bookingid: string) => {
        setLoading("Processing, please wait..")
        const response = await approveBooking(bookingid)
        setLoading("")

        if (response.status == 500) {
          toast({
            title: 'An error occured!',
            description: 'An error occured, we are unable to process your request!',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Approved a booking!',
          description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
        })
        setReload(true)
      }

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
              <DropdownMenuItem onClick={() => handleOperation("view")}>View details</DropdownMenuItem>
              {
                row.original.status == "Pending" && (
                  <>
                    <DropdownMenuItem className="text-green-500" onClick={() => handleBookingApproval(row.original.id)}>Approve</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => handleOperation("reject")}>Reject</DropdownMenuItem>
                  </>
                )
              }
              {
                row.original.status == "Approved" && (
                  <>
                    <DropdownMenuItem className="text-orange-500" onClick={() => window.open(window.location.origin + '/reschedule/' + row.original.id)}>Reschedule</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => handleOperation("cancel")}>Cancel booking</DropdownMenuItem>
                  </>
                )
              }
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
            <DialogContent className={clsx("", {
              "min-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col": operation == "view"
            })}
              disableclose={zoom}
            >
              {
                operation == "view" ? (
                  <FullBookingDetails data={row.original} />
                ) : operation == "reject" ? (
                  <RejectionForm data={row.original} close={() => setOpenModal(false)} />
                ) : operation == "cancel" ? (
                  <CancelBookingPolicy
                    dataid={row.original.id}
                    bookingid={row.original.bookingid}
                    close={() => setOpenModal(false)}
                    adminRequest
                  />
                ) : operation == "noshow" && (
                  <NoShowForm
                    booking={row.original}
                    close={() => setOpenModal(false)}
                  />
                )
              }
            </DialogContent>
          </Dialog>
          <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
        </>
      )
    },
  }

  const filterComponent = (
    <>
      <DropdownMenu modal={false}>
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
    </>
  )

  const searchfilterComponent = (
    <>
      <Input
        placeholder={`Search ${searchBy}...`}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        className="max-w-[300px]"
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ListFilter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Search by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={searchBy} onValueChange={setSearchBy}>
            <DropdownMenuRadioItem value="id">Booking ID</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Guest name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => resetFilter()} className="text-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <>
      <ReloadProvider>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={[...bookingColumns, action]}
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