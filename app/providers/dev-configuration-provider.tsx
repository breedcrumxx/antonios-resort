'use client'

import { devconfig, DevsConfigType } from "@/lib/configs/config-file"
import { createContext, useContext } from "react"

export const DevsConfigContext = createContext<{ dev: DevsConfigType }>({ dev: devconfig })

export default function DevsConfigProvider({ children, dev }: { children: React.ReactNode, dev: DevsConfigType }) {

  return (
    <DevsConfigContext.Provider value={{
      dev
    }}>
      {children}
    </DevsConfigContext.Provider>
  )
}

export const useDevs = () => {
  return useContext(DevsConfigContext)
}