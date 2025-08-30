'use client'

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeadTabs() {

  const pathname = usePathname()

  return (
    <div className="mx-4 sm:mx-0 flex gap-2">
      <div className="w-max flex items-center p-[5px] gap-4 bg-white rounded-sm border">
        <Link prefetch={true} href="/profile" className={clsx("capitalize sm:lower px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname == "/profile" }
        )}><span className="hidden sm:inline">My</span> profile</Link>
        <Link prefetch={true} href="/profile/mybookings" className={clsx("capitalize sm:lower px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname.includes("/profile/mybookings") }
        )}><span className="hidden sm:inline">My</span> bookings</Link>
        <Link prefetch={true} href="/profile/mycoupons" className={clsx("capitalize sm:lower px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname == "/profile/mycoupons" }
        )}><span className="hidden sm:inline">My</span> coupons</Link>
        <Link prefetch={true} href="/profile/discussions" className={clsx("capitalize sm:lower px-2 py-1 text-gray-500 text-sm rounded-sm",
          { "text-white bg-prm": pathname == "/profile/discussions" }
        )}><span className="hidden sm:inline">My</span> discussions</Link>
      </div>
    </div>
  )
}