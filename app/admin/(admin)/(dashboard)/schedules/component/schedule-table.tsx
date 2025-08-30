'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { useState } from "react"
import { scheduleColumns } from "./schedule-columns"
import ScheduleForm from "./schedule-form"

export default function TableTop() {

  // states
  const [openAddSchedule, setOpenAddSchedule] = useState<boolean>(false)

  return (
    <div className="h-full pt-5 gap-5">
      <PaginationProvider changepage={(e) => { }}>
        <TableWrapper
          api={"/schedules"}
          columns={scheduleColumns}
          searchRef="servicename"
          callToAdd={() => setOpenAddSchedule(true)}
          defaultpagination
          disablesearch
        />
      </PaginationProvider>
      <Dialog open={openAddSchedule} onOpenChange={() => setOpenAddSchedule(false)} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Default Schedule</DialogTitle >
            <DialogDescription>
              Schedules that can be used while making a new offer.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm close={() => setOpenAddSchedule(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}