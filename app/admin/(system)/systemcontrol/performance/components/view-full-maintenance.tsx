'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Separator } from "@/app/components/ui/separator"
import { maintenanceschema } from "@/lib/zod/z-schema"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { z } from "zod"
import RescheduleMaintenance from "./reschedule-maintenance"
import AbortMaintenance from "./abort-maintenance"

export default function ViewFullMaintenanceDetails({ data, close }: { data: z.infer<typeof maintenanceschema>, close: () => void }) {

  // states
  const [openReschedulePanel, setOpenReschedulePanel] = useState<boolean>(false)
  const [openAbort, setOpenAbort] = useState<boolean>(false)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Maintenance details</DialogTitle>
      </DialogHeader>
      <div className="space-y-2 flex-grow overflow-y-scroll scroll">
        <h1 className="font-semibold">Initiator</h1>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Name</p>
          <p className="text-sm capitalize">{data.initiator.firstname + " " + data.initiator.lastname}</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Email</p>
          <p className="text-sm">{data.initiator.email}</p>
          <p></p>
        </div>
        <Separator />
        <h1 className="font-semibold">Information</h1>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Title</p>
          <p className="text-sm">{data.title}</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Description</p>
          <p className="text-sm">{data.memo}</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Status</p>
          <p className={clsx("text-sm", {
            'text-red-500': data.status == "Aborted",
            'text-green-500': data.status == "On-process",
            'text-orange-500': data.status == "Pending",
            'text-blue-500': data.status == "Completed",
          })}>{data.status}</p>
          <p className="text-right pr-4">{data.status == "Pending" && (
            <span className="cursor-pointer text-right text-sm text-red-500 hover:underline" onClick={() => setOpenAbort(true)}>Abort</span>
          )}</p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Maintenance start</p>
          <p className="text-sm">{format(data.start, "MMMM d, yyyy 'at' h:mm a")}</p>
          <p className="text-right pr-4">{data.status == "Pending" && data.type != "immediate" && (
            <span className="cursor-pointer text-right text-sm text-blue-500 hover:underline" onClick={() => setOpenReschedulePanel(true)}>Reschedule</span>
          )}</p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Maintenance end</p>
          <p className="text-sm">{data.end ? format(data.end, "MMMM d, yyyy 'at' h:mm a") : "unknown"}</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Duration</p>
          <p className="text-sm">{data.duration} hr/s</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Type</p>
          <p className="text-sm capitalize">{data.type} maintenance</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Coverage</p>
          <p className="text-sm capitalize">{data.coverage}</p>
          <p></p>
        </div>
        <Separator />
        <h1 className="font-semibold">Additional Information</h1>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Issue date</p>
          <p className="text-sm">{format(data.issuedate, "MMMM d, yyyy 'at' h:mm a")}</p>
          <p></p>
        </div>
        <div className="grid grid-cols-3">
          <p className="text-sm font-semibold text-gray-500">Last updated</p>
          <p className="text-sm">{format(data.lastupdated, "MMMM d, yyyy 'at' h:mm a")}</p>
          <p></p>
        </div>
      </div>
      <Dialog open={openReschedulePanel} onOpenChange={(e) => setOpenReschedulePanel(e)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <RescheduleMaintenance
              data={data}
              close={close}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openAbort} onOpenChange={(e) => setOpenAbort(e)}>
        <DialogContent>
          <div className="space-y-2">
            {
              openAbort && (
                <AbortMaintenance
                  data={data}
                  close={() => setOpenAbort(false)}
                />
              )
            }
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}