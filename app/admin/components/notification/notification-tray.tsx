'use client'

import { Badge } from 'antd';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationCards from './notification-cards';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/app/components/ui/sheet";
import { countUnreadNotifications, readAll } from '@/lib/actions/system-actions/notification-actions';
import clsx from 'clsx';
import FullBookingDetails from '../bookings-feature/full-booking-details';
import { useNotification } from './notification-provider';
import ZoomerContextProvider, { useZoom } from '../../(admin)/(dashboard)/bookings/booking-components/zoomer-provider';

export default function NotificationTray() {

  // context
  const { zoom } = useZoom()
  const { tab, setTab, open, setOpen, type } = useNotification()

  // states
  const [selectedBookingid, setSelectedBookingid] = useState<string>("")

  // values 
  const [count, setCount] = useState<number>(0)

  const fetchData = async () => {
    const response = await countUnreadNotifications(type)

    if (response.status == 200) setCount(response.data)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      <Sheet open={open} onOpenChange={(e) => setOpen(e)}>
        <Badge count={count}>
          <SheetTrigger asChild>
            <Button variant={"outline"} onClick={() => setOpen(true)}>
              <Bell className="h-4 w-4" />
            </Button>
          </SheetTrigger>
        </Badge>
        <SheetContent className="flex flex-col overflow-hidden p-0" onInteractOutside={() => setOpen(false)}>
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="w-full flex gap-2 px-4">
            <p className={clsx("py-1 px-2 rounded-sm cursor-pointer hover:bg-muted hover:text-black", { "bg-black text-white": tab == "All" })}
              onClick={() => setTab("All")}>All</p>
            <p className={clsx("py-1 px-2 rounded-sm cursor-pointer hover:bg-muted hover:text-black", { "bg-black text-white": tab == "Unread" })}
              onClick={() => setTab("Unread")}>Unread</p>
            <div className="flex-grow"></div>
            <p className='text-sm py-1 px-2 rounded-sm hover:bg-muted cursor-pointer' onClick={async () => {
              setOpen(false)
              await readAll(type)
              await fetchData()
            }}>Mark all as read</p>
          </div>
          <NotificationCards
            selectBooking={(id: string) => setSelectedBookingid(id)}
          />
        </SheetContent>
      </Sheet>
      <ZoomerContextProvider>
        <Dialog open={selectedBookingid.length > 0} onOpenChange={(e) => setSelectedBookingid("")}>
          <DialogContent className="min-w-[80vw] min-h-[80vh] max-w-[80vw] max-h-[80vh] flex flex-col overflow-hidden" disableclose={zoom}>
            <FullBookingDetails data={{ id: selectedBookingid } as BookingDataTable} />
          </DialogContent>
        </Dialog>
      </ZoomerContextProvider>
    </>
  );
}
