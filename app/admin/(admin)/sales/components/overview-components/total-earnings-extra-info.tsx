'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from "@/app/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { Separator } from '@/app/components/ui/separator'
import { TotalIncomeExtraType } from "@/lib/actions/dashboard-calls/sales-overview/bookings-sales"
import { ListFilter } from "lucide-react"
import { useExtraData } from "./extra-wrapper"

export default function TotalEarningExtraInfo() {

  const { data }: { data: TotalIncomeExtraType | null } = useExtraData()

  return (
    <>
      {
        data && (
          <Popover>
            <PopoverTrigger className="absolute top-4 right-4" asChild>
              <ListFilter className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
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
                  <Separator />
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="cancelled">Entrance fees:</Label>
                    <Input
                      id="cancelled"
                      defaultValue={"₱ " + data.totalentrances.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="cancelled">Reschedules:</Label>
                    <Input
                      id="cancelled"
                      defaultValue={"₱ " + data.totalofreschedules.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="rejected">Penalties:</Label>
                    <Input
                      id="rejected"
                      defaultValue={"₱ " + data.totalpenalties.toLocaleString()}
                      className="col-span-2 text-xs h-6 pointer-events-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs" htmlFor="rejected">Breakage:</Label>
                    <Input
                      id="rejected"
                      defaultValue={"₱ " + data.totalbreakage.toLocaleString()}
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