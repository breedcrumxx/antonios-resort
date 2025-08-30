'use state'

import React, { createContext, useContext } from "react"

export const ExtraWrapperContext = createContext<any>(null)

export default function ExtraWrapperProvider({ children, data }: { children: React.ReactNode, data: any }) {

  return (
    <ExtraWrapperContext.Provider value={{
      data
    }}>
      {children}
    </ExtraWrapperContext.Provider>
  )

}

export const useExtraData = () => {
  return useContext(ExtraWrapperContext)
}