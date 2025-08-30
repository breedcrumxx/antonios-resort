'use client'

import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { useDebounce } from "@/lib/utils/debounce"
import { ChevronDown, ListFilter, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import CouponForm from "./coupon-form"
import { columns } from "./coupons-columns"

export default function TableTop() {

  // states 
  const [status, setStatus] = useState<string>("All")
  const [openAddCoupon, setOpenAddCoupon] = useState<boolean>(false)

  // values
  const [searchBy, setSearchBy] = useState<string>("code")
  const [searchValue, setSearchValue] = useState<string>("")
  const [queryLink, setQueryLink] = useState<string>(`/coupons?status=${status}`)

  const searched = useDebounce(searchValue, 500)

  useEffect(() => {
    setQueryLink(`/coupons?status=${status}${(searched.length > 0 ? `&searchby=${searchBy}&searchvalue=${searched}` : "")}`)
  }, [status, searched, searchBy])

  const filterComponent = (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Status {status} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="text-green-500" value="Active">Active</DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="text-gray-500" value="Disabled">Disabled</DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="text-red-500" value="Deleted">Deleted</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatus("All")} className="text-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
            <DropdownMenuRadioItem value="code">Coupon code</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="label">Label</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setSearchBy("code")
            setSearchValue("")
          }} className="text-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <>

      <TableWrapper
        api={queryLink}
        columns={columns}
        hidden={{ type: false, class: false, timestart: false }}
        searchRef={"bookingid"}
        callToAdd={() => setOpenAddCoupon(true)}
        disablesearch
        filtercomponent={filterComponent}
        searchfiltercomponent={searchfilterComponent}
        defaultpagination
      />

      <Dialog open={openAddCoupon} onOpenChange={(e) => setOpenAddCoupon(e)}>
        <DialogContent className="min-h-[50vh] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create and Deploy New Coupons</DialogTitle>
            <DialogDescription>Create and launch promotional coupons to attract customers and increase sales.</DialogDescription>
          </DialogHeader>
          <CouponForm
            close={() => setOpenAddCoupon(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}