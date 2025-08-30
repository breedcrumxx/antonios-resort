'use client'

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { dashboardRoutes, subroutes, SubRoutesType } from "./sub-routes"
import React from "react"

export default function LinkMapper({ user }: { user: UserSession }) {

  const pathname = usePathname()

  // values 
  const [activeSubRoutes, setActiveSubRoutes] = useState<SubRoutesType[]>([])

  useEffect(() => {

    const segments = pathname.split("/").filter((item) => item.length > 0)

    if (dashboardRoutes.some((item) => item.link == pathname) || pathname.includes("/admin/inbox")) {
      setActiveSubRoutes([...dashboardRoutes])
      return
    }

    if (segments.length > 1) { // route that is not the default /admin
      const temp = subroutes[subroutes.findIndex((item) => item.route == segments[1])].routes
      setActiveSubRoutes([...temp])
    }
  }, [pathname])

  return (
    <>
      {
        activeSubRoutes.map((item: SubRoutesType, i: number) => {

          if (item.link.length == 0) {
            return (
              <span key={i}>{item.icon}</span>
            )
          }

          return (
            <Link href={item.link} replace={true} prefetch={true} className={clsx("flex items-center gap-3 rounded-[5px] px-3 py-2 transition-all hover:bg-muted hover:text-black cursor-pointer", {
              "bg-black text-white": pathname == item.link || (pathname.includes("/inbox") && item.link.includes("/inbox")),
              "hidden": !user.role[item.access as keyof typeof user.role]
            },
            )}
              key={i}
            >
              {item.icon} {item.title}</Link>
          )
        })
      }
    </>
  )
}