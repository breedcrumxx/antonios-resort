'use client'
import React, { createContext, useContext, useState } from "react"

type ReloaderContextType = {
  reload: boolean
  setReload: React.Dispatch<React.SetStateAction<boolean>>
}

export const ReloaderContext = createContext<ReloaderContextType>({
  reload: false,
  setReload: () => { }
})

export default function ReloadProvider({ children }: { children: React.ReactNode }) {

  const [reload, setReload] = useState<boolean>(false)

  return (
    <ReloaderContext.Provider value={{ reload, setReload }}>
      {children}
    </ReloaderContext.Provider>
  )
}

export function useReload() {
  const context = useContext(ReloaderContext)
  return context
}