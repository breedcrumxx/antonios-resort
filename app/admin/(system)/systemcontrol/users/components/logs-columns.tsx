'use client'

import { Checkbox } from "@/app/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip"
import { userlog } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import z from 'zod'

export const LogsColumns: ColumnDef<z.infer<typeof userlog>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "ipaddress",
    accessorKey: "ipaddress",
    header: "IP",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.ipaddress}</div>
    ),
  },
  {
    id: "device",
    accessorKey: "device",
    header: "Device",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.device}</div>
    ),
  },
  {
    id: "activity",
    accessorKey: "activity",
    header: "Activity",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="">{row.original.activity}</div>
    ),
  },
  {
    id: "webpage",
    accessorKey: "webpage",
    header: "Webpage",
    enableHiding: false,
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="">{row.original.weblocation.slice(0, 25)}{row.original.weblocation.length > 25 ? "..." : ""}</div>
        </TooltipTrigger>
        <TooltipContent align="center">
          <p>{row.original.weblocation}</p>
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{format(row.original.logdate, "MM/dd/yy HH:mm")}</div>
    ),
  },
]