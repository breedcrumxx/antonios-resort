'use client'

import { Skeleton } from '@/app/components/ui/skeleton';
import { read } from '@/lib/actions/system-actions/notification-actions';
import { defaultprofile } from '@/lib/configs/config-file';
import { notification } from '@/lib/zod/z-schema';
import { Spinner } from '@nextui-org/spinner';
import clsx from 'clsx';
import { format } from "date-fns";
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { z } from 'zod';
import { useNotification } from './notification-provider';

export default function NotificationCards({ selectBooking }: { selectBooking: (id: string) => void }) {

  const router = useRouter()
  const pathname = usePathname()

  // context
  const { page, setPage, maxPage, notifications, loading, setOpen } = useNotification()

  const processAction = (item: z.infer<typeof notification>) => {
    setOpen(false)
    read(item.id)

    if (item.extra && item.extratype) {
      if (item.extratype == "bookingid") {
        if (pathname == "/admin/bookings") {
          selectBooking(item.id)
          return
        }
        router.push("/admin/bookings")
        sessionStorage.setItem("command", item.extra)
        return
      }
      if (item.extratype == "link") {
        router.push(item.extra as string)
        return
      }
    }
  }

  return (
    <div className="flex-grow overflow-y-scroll scroll">
      {
        loading ? (
          <div className="w-full">
            <div className="w-full h-[100px] py-2  px-4">
              <div className='flex gap-2'>
                <div className="min-w-[50px] min-h-[50px] max-w-[50px] max-h-[50px] rounded-full bg-gray-500 relative overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="flex-col space-y-2 my-auto">
                  <Skeleton className="w-[150px] h-4 bg-gray-500" />
                  <Skeleton className="w-[200px] h-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="w-[50px] h-2" />
              </div>
            </div>
            <div className="w-full h-[100px] py-2  px-4">
              <div className='flex gap-2'>
                <div className="min-w-[50px] min-h-[50px] max-w-[50px] max-h-[50px] rounded-full bg-gray-500 relative overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="flex-col space-y-2 my-auto">
                  <Skeleton className="w-[150px] h-4 bg-gray-500" />
                  <Skeleton className="w-[200px] h-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="w-[50px] h-2" />
              </div>
            </div>
            <div className="w-full h-[100px] py-2  px-4">
              <div className='flex gap-2'>
                <div className="min-w-[50px] min-h-[50px] max-w-[50px] max-h-[50px] rounded-full bg-gray-500 relative overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="flex-col space-y-2 my-auto">
                  <Skeleton className="w-[150px] h-4 bg-gray-500" />
                  <Skeleton className="w-[200px] h-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="w-[50px] h-2" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {notifications.map((item, i) => (
              <>
                <button key={item.id} className={clsx("text-left w-full bg-white hover:bg-gray-300/30", { "bg-gray-300/20": !item.read })} onClick={() => processAction(item)}>
                  <div className="w-full py-2  px-4">
                    <div className='flex gap-2'>
                      <div className="min-w-[50px] min-h-[50px] max-w-[50px] max-h-[50px] rounded-full bg-gray-500 relative overflow-hidden">
                        <Image
                          fill
                          src={item.user?.image || defaultprofile}
                          alt="profile-picture"
                          className=""
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold">{item.head}</h1>
                        <p className="text-xs">{item.content}</p>
                        <p className="text-xs text-gray-500">{
                          new Date().setHours(0, 0, 0, 0) === new Date(item.date).setHours(0, 0, 0, 0) ? (
                            format(new Date(item.date), "'Today' h:mm a")
                          ) : (
                            format(new Date(item.date), "PPP")
                          )
                        }</p>
                      </div>
                    </div>
                    <div className={clsx("flex justify-end", { "hidden": item.read })}>
                      <p className="text-xs text-gray-500 cursor-pointer hover:underline" onClick={() => read(item.id)}>Mark as read</p>
                    </div>
                  </div>
                </button>
              </>
            ))}
            {
              notifications.length == 0 && (
                <div className="py-5 text-sm text-center">No notifications...</div>
              )
            }
            {
              maxPage > page && (
                <div className="text-sm text-center py-2 hover:bg-muted/30 hover:underline cursor-pointer" onClick={() => setPage((prev) => (prev + 1))}>Load more</div>
              )
            }
          </>
        )
      }
    </div>
  );
};
