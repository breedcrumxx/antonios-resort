'use client'

import { Dialog, DialogContent } from "@/app/components/ui/dialog"

export default function interruptDialog({
  children,
  open,
  className,
}: {
  children: React.ReactNode,
  open: boolean
  className?: string,
}) {

  return (
    <Dialog open={open}>
      <DialogContent className={className} disableclose>
        {children}
      </DialogContent>
    </Dialog>
  )
}