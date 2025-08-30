'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { defaultschedules } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import { add, format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import moment from "moment"
import { useState } from "react"
import z from 'zod'
import DeleteSchedule from "./delete-schedule"
import ScheduleForm from "./schedule-form"

export const scheduleColumns: ColumnDef<z.infer<typeof defaultschedules>>[] = [
  {
    id: "type",
    accessorKey: "type",
    header: "Type",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.type}</div>
    ),
  },
  {
    id: "slot",
    accessorKey: "slot",
    header: "Slot",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.slot} {row.original.type != "cottage" ? "tour" : "stay"}</div>
    ),
  },
  {
    id: "checkin",
    accessorKey: "checkin",
    header: "Check-in",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="">{format(moment(row.original.timein, "hh:mm a").toDate(), "hh:mm a")}</div>
    ),
  },
  {
    accessorKey: "checkout",
    header: "Check-out",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="">{
        row.original.type == "villa" ? (
          <>
            {
              format(add(new Date().setHours(parseInt(row.original.timein.split(":")[0]), parseInt(row.original.timein.split(":")[1])), { hours: row.original.duration }), "hh:mm a")
            }
          </>
        ) : (
          <>
            {row.original.type == "event" && "(Up-to) "}{format(moment(row.original.timeout, "hh:mm a").toDate(), "hh:mm a")}
          </>
        )
      }</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }: any) => {

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState<boolean>(false)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [operation, setOperation] = useState<string>('Edit')

      const handleCallToModal = (type: string) => {
        setOperation(type)
        setOpen(true)
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCallToModal('Edit')}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => handleCallToModal('Delete')}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={() => setOpen(false)}>
            <DialogContent>
              {
                operation == 'Edit' ? (
                  <DialogHeader>
                    <DialogTitle>Updage a Default Schedule</DialogTitle >
                    <DialogDescription>
                      Schedules that can be used while making a new offer.
                    </DialogDescription>
                  </DialogHeader>
                ) : null
              }
              <div className="flex-grow px-2 overflow-y-auto scroll">
                {
                  operation == 'Edit' ? (
                    <ScheduleForm
                      data={row.original}
                      close={() => {
                        setOpen(false)
                      }}
                    />
                  ) : (
                    <DeleteSchedule
                      scheduleid={row.original.id}
                      close={() => setOpen(false)}
                    />
                  )
                }
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    }
  }
]
