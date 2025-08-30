'use client'

import CalendarFilter from "@/app/admin/(system)/systemcontrol/components/date-filter"
import { membersColumns } from "@/app/admin/(system)/systemcontrol/components/members-columns"
import SortingButton from "@/app/admin/(system)/systemcontrol/components/sorting-btn"
import ClientProfileAndActivity from "@/app/admin/components/bookings-feature/client-profile"
import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import ReloadProvider, { useReload } from "@/app/providers/reloader"
import { blockAUser, unblockAUser } from "@/lib/actions/account-actions/block-user"
import { resetUserPassword } from "@/lib/actions/account-actions/reset-user-password"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import { useDebounce } from "@/lib/utils/debounce"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from "antd"
import clsx from "clsx"
import { ListFilter, MoreHorizontal, RotateCcw } from "lucide-react"
import React from "react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

export default function TableTop({ user }: { user: UserSession }) {

  // states
  const [page, setPage] = useState<number>(1)
  const [searchBy, setSearchBy] = useState<string>("email")
  const [sort, setSort] = useState<string>("desc")
  const [status, setStatus] = useState<string>("active")
  const [queryLink, setQueryLink] = useState<string>(`/users/client?page=${page}&sort=${sort}&status=${status}`)
  const [enableRange, setEnableRange] = useState<boolean>(false)

  // values
  const [date, setDate] = useState<Date | DateRange | undefined>()
  const [dateQuery, setDateQuery] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("23:59")
  const [searchValue, setSearchValue] = useState<string>("")

  const searchQuery = useDebounce(searchValue, 500)
  const sortValue = useDebounce(sort, 300)

  useEffect(() => {
    setQueryLink(`/users/client?page=${page}&sort=${sortValue}&status=${status}${(searchQuery.length > 0 ? `&searchby=${searchBy}&searchvalue=${searchQuery}` : "")}${dateQuery ? `&range=${encodeURIComponent(JSON.stringify(dateQuery))}` : ""
      }`)
  }, [page, searchQuery, searchBy, sortValue, dateQuery, status])

  const searchfilterComponent = (
    <>
      <Input placeholder={`@${searchBy}...`} className="max-w-[300px]" onChange={(e) => setSearchValue(e.target.value)} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ListFilter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Search by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={searchBy} onValueChange={(e) => setSearchBy(e)}>
            <DropdownMenuRadioItem value="email">Email</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
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
    title: "Date created"
  }

  const filterComponent = (
    <>
      <CalendarFilter {...calendarProps} />
      <SortingButton sort={sort} setSort={setSort} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"}>
            <ListFilter className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={status == "active"}
            onCheckedChange={() => setStatus("active")}
          >
            Active users
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            className="text-red-500"
            checked={status == "blocked"}
            onCheckedChange={() => setStatus("blocked")}
          >
            Blocked users
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  const action = {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      // context
      const { setReload } = useReload()

      // states 
      const [operation, setOperation] = useState<string>("")
      const [loading, setLoading] = useState<boolean>(false)

      const blockUser = async () => {
        setLoading(true)

        const response = await blockAUser(row.original.id)

        if (response.status == 500) {
          message.error("An error occured while blocking a user!")
          setLoading(false)
          return
        }

        message.success("Successfully blocked a user!")
        setLoading(false)
        setReload(true)
      }

      const unblockUser = async () => {
        setLoading(true)

        const response = await unblockAUser(row.original.id)

        if (response.status == 500) {
          message.error("An error occured while unblocking a user!")
          setLoading(false)
          return
        }

        message.success("Successfully unblocked!")
        setLoading(false)
        setReload(true)
      }

      const resetPassword = async () => {
        setLoading(true)

        const response = await resetUserPassword(row.original.email)

        if (response.status == 500) {
          message.error("An error occured while processing your request!")
          setLoading(false)
          return
        }

        message.success("Sent reset password email!")
        setLoading(false)
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
              <DropdownMenuItem onClick={() => setOperation("details")}>View details</DropdownMenuItem>
              {
                row.original.block || new Date(row.original.block).getTime() > new Date().getTime() ? (
                  <>
                    <DropdownMenuItem onClick={() => setOperation("unblock")}>Unblock user</DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuItem className="text-red-500" disabled={row.original.block || new Date(row.original.block).getTime() > new Date().getTime()} onClick={() => setOperation("block")}>Block user</DropdownMenuItem>
                )
              }
              <DropdownMenuItem className="text-red-500" disabled={row.original.block || new Date(row.original.block).getTime() > new Date().getTime()} onClick={() => setOperation("reset")}>Reset password</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
            <DialogContent className={clsx("", {
              "min-w-[80vw] max-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col": operation == "details"
            })}>
              {
                operation == "reset" ? (
                  <CoolDownDialog
                    open={true}
                    close={() => setOperation("")}
                    title={"Reset account password"}
                    description="When you reset a user's password, an email containing a newly generated password will be sent to their registered email address. Please note that if the email address is no longer active, the user will not receive this notification. Ensure that this action is intentional and necessary, as it will immediately update the user's login credentials."
                    accept={() => resetPassword()}
                    isContent
                  />
                ) : operation == "block" ? (
                  <CoolDownDialog
                    open={true}
                    close={() => setOperation("")}
                    title={"Block a user"}
                    description="By blocking this user, you are preventing the user to use the system and it's functionality permanently until lifted. Please ensure this action is intended."
                    accept={() => blockUser()}
                    isContent
                  />
                ) : operation == "unblock" ? (
                  <CoolDownDialog
                    open={true}
                    close={() => setOperation("")}
                    title="Confirm Unblock User"
                    description="You are about to unblock this user. This will restore their access to the account. Are you sure you want to proceed?"
                    accept={() => unblockUser()}
                    isContent
                  />
                ) : operation == "details" && (
                  <>
                    <DialogHeader>
                      <DialogTitle>User information</DialogTitle>
                    </DialogHeader>
                    <ClientProfileAndActivity clientid={row.original.id} />
                  </>
                )
              }
            </DialogContent>
          </Dialog>
          <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Processing, please wait..." />
        </>
      )
    },
  }

  return (
    <>
      <ReloadProvider>
        <PaginationProvider changepage={setPage}>
          <TableWrapper
            api={queryLink}
            columns={[...membersColumns, action]}
            searchRef={"name"}
            disablesearch
            disableadd
            filtercomponent={filterComponent}
            searchfiltercomponent={searchfilterComponent}
          />
        </PaginationProvider>
      </ReloadProvider>
    </>
  )
}