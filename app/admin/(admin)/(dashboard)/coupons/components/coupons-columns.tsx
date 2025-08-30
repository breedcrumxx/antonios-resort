'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { updateCouponStatus } from "@/lib/actions/coupon-actions/coupon-actions"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { extendedcoupons } from "@/lib/zod/z-schema"
import { ColumnDef } from "@tanstack/react-table"
import { message } from 'antd'
import clsx from "clsx"
import { format } from "date-fns"
import { Copy, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import CouponForm from "./coupon-form"
import CouponDetails from "./coupon-details"

export const columns: ColumnDef<z.infer<typeof extendedcoupons>>[] = [
  {
    id: "couponcode",
    accessorKey: "couponcode",
    header: "Coupon code",
    enableHiding: false,
    cell: ({ row }) => (
      <div className=" max-w-[150px] flex items-center gap-2">
        <p className="truncate">{row.original.couponcode}</p>
        <Copy className="w-4 h-4 cursor-pointer" onClick={() => {
          navigator.clipboard.writeText(row.original.couponcode)
          message.success("Copied to clipboard!")
        }} />
      </div>
    ),
  },
  {
    id: "label",
    accessorKey: "label",
    header: "Label",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.couponname}</div>
    ),
  },
  {
    id: "claimed",
    accessorKey: "claimed",
    header: "Claimed",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.user.length}</div>
    ),
  },
  {
    id: "used",
    accessorKey: "used",
    header: "Used",
    enableHiding: false,
    cell: ({ row }) => (
      <div>{row.original.bookings.length}</div>
    ),
  },
  {
    id: "slot",
    accessorKey: "slot",
    header: "Slot",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.max}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className={clsx("capitalize", {
          "text-green-500": row.original.status == "Active",
          "text-red-500": row.original.status == "Disabled",
        })}>
          {row.original.status}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      // context
      const { toast } = useToast()
      const { setReload } = useReload()

      // states 
      const [loading, setLoading] = useState<string>("")
      const [openModal, setOpenModal] = useState<boolean>(false)
      const [operation, setOperation] = useState<string>("")

      const handleOperation = (operation: string) => {
        setOperation(operation)
        setOpenModal(true)
      }

      const handleDisableCoupon = async () => {
        if (operation == "disable") {
          setLoading("Disabling coupon, please wait...")
        } else if (operation == "enable") {
          setLoading("Re-activating coupon, please wait...")
        } else {
          setLoading("Deleting coupon, please wait...")
        }
        const operationreplica = operation == "enable" ? "Active" : operation[0].toUpperCase() + operation.slice(1) + "d"
        const response = await updateCouponStatus(row.original.id, operationreplica)
        setLoading("")

        if (response.status == 500) {
          toast({
            title: "An error occured!",
            description: `Unable to ${operation != "enable" ? operation : "re-active"} the coupon, please try again later!`,
            variant: "destructive"
          })
          return
        }

        setOpenModal(false)
        toast({
          title: `Coupon ${operation}d!`,
          description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")
        })
        setReload(true)
      }

      return (
        <>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOperation("view")}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOperation("update")}>Update</DropdownMenuItem>
              <DropdownMenuSeparator />
              {
                row.original.status == "Disabled" ? (
                  <DropdownMenuItem className="text-green-500" onClick={() => handleOperation("enable")}>Enable</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-gray-500" onClick={() => handleOperation("disable")}>Disable</DropdownMenuItem>
                )
              }
              <DropdownMenuItem className="text-red-500" onClick={() => handleOperation("delete")}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
            <DialogContent className={clsx("max-h-[80vh] flex flex-col overflow-hidden", {
              "min-h-[80vh] min-w-[80vw] max-h-[80vh] max-w-[80vw]": operation == "view"
            })}>
              {
                operation == "view" ? (
                  <>
                    <CouponDetails
                      data={row.original}
                    />
                  </>
                ) : operation == "update" ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Create and Deploy New Coupons</DialogTitle>
                      <DialogDescription>Create and launch promotional coupons to attract customers and increase sales.</DialogDescription>
                    </DialogHeader>
                    <CouponForm
                      data={row.original}
                      close={() => setOpenModal(false)}
                    />
                  </>
                ) : (
                  <CoolDownDialog
                    open={true}
                    close={() => setOpenModal(false)}
                    accept={() => handleDisableCoupon()}
                    title="Disable this coupon"
                    description="Disabled coupons will not show to public coupons page, and claimed coupons will not be available to use."
                    cooldown={3}
                    isContent
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
]

