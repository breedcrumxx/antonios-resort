'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { problemreport, userlog, user as userZodType } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import z from 'zod'
import ViewReportDetails from "./view-report"
import CreateCaseModal from "./create-case"
import clsx from "clsx"

export const ReportsColumn: ColumnDef<z.infer<typeof problemreport>>[] = [
  {
    id: "issueid",
    accessorKey: "issueid",
    header: "Issue ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.issueid}</div>
    ),
  },
  {
    id: "code",
    accessorKey: "code",
    header: "Code",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.code}</div>
    ),
  },
  {
    id: "report",
    accessorKey: "report",
    header: "Report",
    enableHiding: false,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="">{row.original.report.slice(0, 50)} {row.original.report.length > 50 && "..."}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="">{row.original.report}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "status",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.status}</div>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{format(row.original.datetime, "MM/dd/yy HH:mm")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOperation("view")}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOperation("block")}>Open a case</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOperation("block")}>Include in a case</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
            <DialogContent className={clsx("", {
              "max-w-[80vw] max-h-[90vh] min-w-[80vw] min-h-[90vh] flex flex-col overflow-hidden": operation == "view"
            })}>
              {
                operation == "view" ? (
                  <ViewReportDetails
                    data={row.original}
                  />
                ) : (
                  <CreateCaseModal
                    data={row.original}
                    close={() => setOperation("")}
                  />
                )
              }
            </DialogContent>
          </Dialog>
        </>
      )
    },
  }
]