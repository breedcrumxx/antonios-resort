'use client'

import { bookingsession } from '@/lib/zod/z-schema'
import { format, isEqual } from 'date-fns'
import { createContext, useContext, useEffect, useState } from "react"
import z from 'zod'

type StatementContextType = {
  statement: string
  setStatement: React.Dispatch<React.SetStateAction<string>>
}

export const StatementContext = createContext<StatementContextType>({
  statement: "",
  setStatement: () => { },
})

export default function StatementProvider({ children }: { children: React.ReactNode }) {

  // states 
  const [statement, setStatement] = useState<string>("")

  return (
    <StatementContext.Provider value={{
      statement,
      setStatement,
    }}>
      {children}
    </StatementContext.Provider>
  )
}

export const useStatement = () => {
  return useContext(StatementContext)
}