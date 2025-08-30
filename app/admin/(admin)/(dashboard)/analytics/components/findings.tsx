'use client'

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import InsightModal from "./insight-modal";

export default function FindingsPanel() {

  // states
  const [span, setSpan] = useState<number>(3)
  const [openModal, setOpenModal] = useState<boolean>(false)

  return (
    <div className="col-span-4 row-span-2 gap-2 p-4 shadow rounded-sm hover:bg-muted/30">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-xl text-gray-500 font-semibold">Booking Insights</p>
          <p className="text-sm">Gain valuable insights into user booking behaviors and trends.</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Select value={span.toString()} onValueChange={(e) => setSpan(parseInt(e))}>
            <SelectTrigger className="w-max">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenModal(true)}>View insights</Button>
        </div>
      </div>
      <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
        <DialogContent className="min-w-[60vw] max-w-[60vw] min-h-[60vh] max-h-[60vh] flex flex-col overflow-y-hidden">
          <DialogHeader>
            <DialogTitle>Booking insights</DialogTitle>
            <DialogDescription>Gain valuable insights into user booking behaviors and trends.</DialogDescription>
          </DialogHeader>
          <InsightModal span={span} />
        </DialogContent>
      </Dialog>
    </div>
  )
}