'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from "@/app/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { RefundableExtraType } from "@/lib/actions/dashboard-calls/sales-overview/bookings-sales"
import { ListFilter } from "lucide-react"
import { useExtraData } from "./extra-wrapper"
import { Separator } from '@/app/components/ui/separator'

export default function RefundableExtraInfo() {

  const { data }: { data: RefundableExtraType | null } = useExtraData()

  return (
    <>
      {
        data && (
          <Popover>
            <PopoverTrigger className="absolute top-4 right-4" asChild>
              <ListFilter className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-sm">More information</h4>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="cancelled">Completed:</Label>
                    <Input
                      id="cancelled"
                      defaultValue={"₱ " + data.totalofcompleted.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="cancelled">Cancelled:</Label>
                    <Input
                      id="cancelled"
                      defaultValue={"₱ " + data.totalofcancelled.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="rejected">Rejected:</Label>
                    <Input
                      id="rejected"
                      defaultValue={"₱ " + data.totalofrejected.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="invalid">Total:</Label>
                    <Input
                      id="invalid"
                      defaultValue={"₱ " + data.totalofall.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="rejected">Refunded:</Label>
                    <Input
                      id="rejected"
                      defaultValue={"₱ " + data.refunded.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="invalid">Invalid/Expired:</Label>
                    <Input
                      id="invalid"
                      defaultValue={"₱ " + data.totalofinvalid.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    </>
  )
}