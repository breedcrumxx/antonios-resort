'use client'
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { dashboardRoutes } from "./sub-routes";

type SideBarContextType = {
  activeRoute: string
  setActiveRoute: React.Dispatch<React.SetStateAction<string>>
}

export const SideBarContext = createContext<SideBarContextType>({
  activeRoute: '',
  setActiveRoute: () => { },
})

export function SideBarProvider({ children }: { children: React.ReactNode }) {

  const [activeRoute, setActiveRoute] = useState<string>('overview')

  const pathname = usePathname()

  const items = pathname.split("/")

  useEffect(() => {
    if (dashboardRoutes.some((item) => item.link == pathname) || pathname.includes("/admin/inbox")) {
      setActiveRoute('dashboard')
      return
    } else {
      setActiveRoute(items[2])
    }
  }, [pathname])

  return (
    <SideBarContext.Provider value={{ activeRoute, setActiveRoute }}>
      {children}
    </SideBarContext.Provider>
  )
}

export function useSideBar() {
  return useContext(SideBarContext)
}