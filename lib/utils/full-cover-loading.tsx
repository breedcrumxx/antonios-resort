'use client'
import { Spinner } from "@nextui-org/spinner"
import { Dialog, DialogContent } from "../../app/components/ui/dialog"

export default function FullCoverLoading({ open, defaultOpen, loadingLabel }: { open: boolean, defaultOpen: boolean, loadingLabel: string }) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen}>
      <DialogContent className="bg-transparent border-none shadow-none pointer-event-none" disableclose={true} enablex={false}>
        <Spinner label={loadingLabel}
          size="lg"
          classNames={{
            circle1: "border-b-white",
            circle2: "border-b-white",
            label: "text-white text-sm"
          }} />
      </DialogContent>
    </Dialog>
  )
}