'use client'

import { useZoom } from "@/app/admin/(admin)/(dashboard)/bookings/booking-components/zoomer-provider"
import FullBookingDetails from "@/app/admin/components/bookings-feature/full-booking-details"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { message } from 'antd'
import clsx from "clsx"
import { ArrowUpDown, Copy, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useChat } from "../../components/client-chat/provider"
import CancelBookingPolicy from "./cancel-booking-policy"
import RefundBookingForm from "./refund-booking-form"
import { differenceInMinutes, differenceInSeconds, format } from "date-fns"
import ContinuePayment from "./continue-payment"
import { EdgeStoreProvider } from "@/lib/edgestore"
import { useReload } from "@/app/providers/reloader"

export const columns: ColumnDef<UserBookingDataTable>[] = [
  {
    id: "bookingid",
    accessorKey: "bookingid",
    header: "Booking ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className=" max-w-[150px] flex items-center gap-1">
        <p className="truncate">{row.original.bookingid}</p>
        <Copy className="w-auto h-max cursor-pointer" onClick={() => {
          navigator.clipboard.writeText(row.original.bookingid)
          message.success("Copied to clipboard!")
        }} />
      </div>
    ),
  },
  {
    id: "package",
    accessorKey: "package",
    header: "Package",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.package}</div>
    ),
  },
  {
    id: "startdate",
    accessorKey: "startdate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reservation date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableHiding: false,
    cell: ({ row }) => {

      const date = new Date(row.original.checkin).toISOString().split("T")[0]

      return (
        <div className="text-center">
          {date}
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          &#8369; {row.original.total.toLocaleString()}
        </div>
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
          "text-yellow-500": row.original.status == "Pending",
          "text-green-500": row.original.status == "Approved",
          "text-blue-500": row.original.status == "Completed",
          "text-red-500": ['Rejected', 'Cancelled'].some((item) => item == row.original.status)
        })}>
          {row.original.status}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    accessorKey: "actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      // context
      const { setOpen, setOperation, setBooking } = useChat()
      const { zoom } = useZoom()
      const { setReload } = useReload()

      // states
      const [openModal, setOpenModal] = useState<boolean>(false)
      const [action, setAction] = useState<string>("")
      const [countdown, setCountdown] = useState<number>(0)

      const handleAction = (action: string) => { // control what content of the modal will appear
        setAction(action)
        setOpenModal(true)
      }

      useEffect(() => {
        let intervalId: NodeJS.Timeout
        // calculate the remaining time
        if (row.original.status == "Waiting") {
          intervalId = setInterval(() => {
            const target = new Date(row.original.book_at).getTime() + (900 * 1000) // 15 mins threshold
            const current = differenceInSeconds(target, new Date())

            if (current == 0) return

            setCountdown(current)

          }, 1000)
        }

        return () => {
          clearInterval(intervalId)
        }
      }, [])


      const minutes = Math.floor(countdown / 60)
      const seconds = countdown % 60

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
              <DropdownMenuItem onClick={() => handleAction('view')}>View details</DropdownMenuItem>
              {
                ['Waiting'].some((item) => item == row.original.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-red-500">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`} {minutes > 0 ? "minutes" : "seconds"}</DropdownMenuLabel>
                    <DropdownMenuItem className="text-blue-500" onClick={() => handleAction('continue')}>Continue payment</DropdownMenuItem>
                  </>
                )
              }
              {
                ['Cancelled', 'Rejected'].some((item) => item == row.original.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-green-500" onClick={() => handleAction('refund')}>Request refund</DropdownMenuItem>
                  </>
                )
              }
              {
                row.original.status != "Waiting" && (
                  <DropdownMenuItem className="text-green-500" onClick={() => {
                    setBooking(row.original)
                    setOperation("new")
                    setOpen(true)
                  }}>Open discussion</DropdownMenuItem>
                )
              }
              {
                ['Upcoming', 'Pending', 'Approved'].some((item) => item == row.original.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => handleAction('cancel')}>Cancel booking</DropdownMenuItem>
                  </>
                )
              }
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
            <DialogContent className={clsx({
              "px-2 sm:px-6 min-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col": action == "view",
              "min-h-[80vh] max-h-[80vh]": action == "continue"
            })}
              disableclose={zoom}
            >
              {
                action == "view" ? (
                  <FullBookingDetails data={{ id: row.original.id } as BookingDataTable} isMyBooking />
                ) : action == "cancel" ? (
                  <CancelBookingPolicy
                    dataid={row.original.id}
                    bookingid={row.original.bookingid}
                    client={row.original.client}
                    close={() => setOpenModal(false)}
                  />
                ) : action == 'refund' ? (
                  <RefundBookingForm
                    data={{ id: row.original.id, refund: row.original.refund, user: row.original.client, status: row.original.status }}
                    bookingid={row.original.bookingid}
                    close={() => setOpenModal(false)}
                  />
                ) : action == "continue" ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-center">Continue Payment</DialogTitle>
                      <DialogDescription className="text-center">Time remaining: <span className="text-red-500"> {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`} {minutes > 0 ? "minutes" : "seconds"}</span></DialogDescription>
                    </DialogHeader>
                    <EdgeStoreProvider>
                      <ContinuePayment
                        total={row.original.total}
                        transactionid={row.original.transacid}
                        reload={() => setReload(true)}
                        close={() => setOpenModal(false)}
                        countdown={countdown}
                        downpayment={row.original.downpaymentasofnow}
                        type={row.original.transaction.payment_type}
                        setView={(value: string) => setAction(value)}
                      />
                    </EdgeStoreProvider>
                  </>
                ) : action == "paid" && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Payment successful!</DialogTitle>
                      <DialogDescription>Your booking payment was successful and now on Pending status, please wait for the admin to verify your booking. Meanwhile, you can get a copy of the receipt under the view details.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button className="bg-prm" onClick={() => setReload(true)}>Okay</Button>
                    </DialogFooter>
                  </>
                )
              }
            </DialogContent>
          </Dialog>
        </>
      )
    },
  }
]