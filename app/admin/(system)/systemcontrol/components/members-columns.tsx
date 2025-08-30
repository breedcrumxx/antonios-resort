'use client'

import { Checkbox } from "@/app/components/ui/checkbox"
import { user } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { format } from "date-fns"
import z from 'zod'

export const membersColumns: ColumnDef<z.infer<typeof user>>[] = [
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
    id: "email",
    accessorKey: "email",
    header: "@email",
    enableHiding: false,
    cell: ({ row }) => (
      <div className={clsx("", { "text-red-500": row.original.block && row.original.block && new Date(row.original.block).getTime() > new Date().getTime() })}>{row.original.email}</div>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
    cell: ({ row }) => (
      <div className={clsx("capitalize", { "text-red-500": row.original.block && row.original.block && new Date(row.original.block).getTime() > new Date().getTime() })}>{row.original.firstname + " " + row.original.lastname}</div>
    ),
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    enableHiding: false,
    cell: ({ row }) => (
      <div className={clsx("capitalize", { "text-red-500": row.original.block && row.original.block && new Date(row.original.block).getTime() > new Date().getTime() })}>{row.original.role.role}</div>
    ),
  },
  {
    id: "datecreated",
    accessorKey: "datecreated",
    header: "Date created",
    enableHiding: false,
    cell: ({ row }) => (
      <div className={clsx("", { "text-red-500": row.original.block && row.original.block && new Date(row.original.block).getTime() > new Date().getTime() })}>{format(row.original.datecreated, "PPP")}</div>
    ),
  },
]