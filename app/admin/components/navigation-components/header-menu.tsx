'use client'

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationTray from '../notification/notification-tray';
import { HeaderLinks } from './header-links';
import NotificationProvider from '../notification/notification-provider';
import ZoomerContextProvider from '../../(admin)/(dashboard)/bookings/booking-components/zoomer-provider';

export default function HeaderMenu({ user }: { user: UserSession }) {

  const pathname = usePathname()

  return (
    <div className={clsx("flex flex-col group relative transition-all duration-[.3s]")}>
      <header className={clsx("flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6")}>
        <div>
          {
            !user.role.systemcontrol && (
              <HeaderLinks />
            )
          }
        </div>
        <div className='flex-grow'></div>
        <ZoomerContextProvider>
          <NotificationProvider type={user.role.systemcontrol ? "SA" : "admin"}>
            <NotificationTray />
          </NotificationProvider>
        </ZoomerContextProvider>
        <div className="p-1 bg-muted rounded-sm">
          <Link prefetch href="/" className='text-xs p-1 px-2 rounded-sm bg-muted text-foreground'>Website</Link>
          <Link prefetch href={pathname} className='text-xs p-1 px-2 rounded-sm bg-muted text-foreground bg-white'>Admin Panel</Link>
        </div>
      </header>
    </div>
  )
}