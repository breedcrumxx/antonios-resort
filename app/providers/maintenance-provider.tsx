'use client'

import { maintenanceschema } from "@/lib/zod/z-schema"
import { add } from "date-fns"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect } from "react"
import { z } from "zod"

type MaintenanceCotextType = {
  maintenance: z.infer<typeof maintenanceschema> | null
}

export const MaintenanceContext = createContext<MaintenanceCotextType>({
  maintenance: null
})

export default function MaintenanceProvider({ children, data }: { children: React.ReactNode, data: z.infer<typeof maintenanceschema> | null }) {

  const router = useRouter()

  useEffect(() => {
    if (data) {
      if (data.duration == 0 && data.start.getTime() <= new Date().getTime()) {
        router.push("/maintenance")
      }
      if (data.duration > 0 && data.start.getTime() <= new Date().getTime() && add(data.start, { hours: data.duration }).getTime() >= new Date().getTime()) {
        router.push("/maintenance")
      }
    }
  }, [data])

  return (
    <MaintenanceContext.Provider value={{
      maintenance: data
    }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export const useMaintenance = () => {
  return useContext(MaintenanceContext)
}

