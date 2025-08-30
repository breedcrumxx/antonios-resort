'use client'

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
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { months } from "@/lib/utils/month-filter-utils"
import { ColumnDef } from "@tanstack/react-table"
import { message } from "antd"
import clsx from "clsx"
import { ListFilter, MoreHorizontal, RotateCcw, FileBarChart } from "lucide-react"
import { useEffect, useState } from "react"
import { useFilter } from "../provider"
import { useZoom } from "../../../(dashboard)/bookings/booking-components/zoomer-provider"

type BookingSalesTable = {
  id: string,
  packagename: string,
  guestname: string,
  refundable: boolean,
  datecompleted: Date,
  refundableamount: number,
  total: number
}

export const columns: ColumnDef<BookingSalesTable>[] = [
  {
    id: "bookingid",
    accessorKey: "Booking ID",
    header: "Booking ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize text-sm">{row.original.id}</div>
    ),
  },
  {
    id: "guestname",
    accessorKey: "guestname",
    header: "Guest name",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize text-sm">{row.original.guestname}</div>
    ),
  },
  {
    id: "packagename",
    accessorKey: "packagename",
    header: "Package ",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize text-sm">{row.original.packagename}</div>
    ),
  },
  {
    accessorKey: "refundable",
    header: "Refundable",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className={clsx("capitalize", {
          "text-green-500": row.original.refundable,
          "text-red-500": !row.original.refundable
        })}>
          {row.original.refundable ? "Yes" : "No"}
        </div>
      )
    },
  },
  {
    accessorKey: "Refundable amount",
    header: "Refundable amount",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div>&#8369; {row.original.refundableamount.toLocaleString()}</div>
      )
    },
  },
  {
    accessorKey: "Booking amount",
    header: "Booking amount",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div> &#8369; {row.original.total.toLocaleString()}</div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    accessorKey: "actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      const { zoom } = useZoom()

      // states
      const [openModal, setOpenModal] = useState<boolean>(false)

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
              <DropdownMenuItem onClick={() => setOpenModal(true)}>View details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
            <DialogContent className="min-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col" disableclose={zoom}>
              <FullBookingDetails data={row.original} />
            </DialogContent>
          </Dialog>
        </>
      )
    },
  }
]

export default function TableBookingSales() {

  // context
  const { filter } = useFilter()

  // states 
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  //values
  const [searchBy, setSearchBy] = useState<string>("id")
  const [searchValue, setSearchValue] = useState<string>("")

  const [queryLink, setQueryLink] = useState<string>(`/bookings/sales?page=1&date=${encodeURI(JSON.stringify(filter))}`)

  const debounce = useDebounce(searchValue, 500)

  // values 
  const [dataCount, setDataCount] = useState<number>(0)

  useEffect(() => {
    setQueryLink(`/bookings/sales?page=${page}&date=${encodeURI(JSON.stringify(filter))}${(debounce.length > 0 ? `&searchby=${searchBy}&searchvalue=${debounce}` : "")}`)
  }, [page, debounce, filter])

  const resetFilter = () => {
    setQueryLink("/bookings/sales/status/Completed?page=1")
  }

  const exportData = async () => {
    if (dataCount == 0) {
      message.error("No data to export!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings/sales/export', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Response-Type": "arrayBuffer",
        },
        body: JSON.stringify(filter)
      });

      setLoading(false)
      if (!response.ok) throw new Error()

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${months[new Date(filter.get.start).getMonth()]}-${new Date(filter.get.start).getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      message.error("Error getting sales data!")
    }
  }

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
          <DropdownMenuItem className="text-red-500" onClick={() => resetFilter()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  const exportbtn = (
    <Button variant={'default'} onClick={() => exportData()}>
      <FileBarChart className="mr-2 h-4 w-4" />
      Export sales
    </Button>
  )

  return (
    <>
      <ReloadProvider>
        <h1 className="font-semibold">Bookings ({dataCount})</h1>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={[...columns]}
            hidden={{ bookingid: false }}
            searchRef={"guestname"}
            disableadd
            disablesearch
            searchfiltercomponent={searchfilterComponent}
            filtercomponent={exportbtn}
            setDataCount={setDataCount}
          />
        </PaginationProvider>
      </ReloadProvider>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Exporting, please wait..." />
    </>
  )
}