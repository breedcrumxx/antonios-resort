'use client'

import React, { createContext, useContext, useEffect, useState } from "react"

type PaginationContextType = {
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  maxPage: number,
  setMaxPage: React.Dispatch<React.SetStateAction<number>>,
}

export const PaginationContext = createContext<PaginationContextType>({
  page: 1,
  setPage: () => { },
  maxPage: 1,
  setMaxPage: () => { },
})

export default function PaginationProvider({ children, changepage }: { children: React.ReactNode, changepage: (page: number) => void }) {

  const [page, setPage] = useState<number>(1)
  const [maxPage, setMaxPage] = useState<number>(0)

  useEffect(() => {
    changepage(page)
  }, [page])

  return (
    <PaginationContext.Provider value={{
      page,
      setPage,
      maxPage,
      setMaxPage,
    }}>
      {children}
    </PaginationContext.Provider>
  )
}

export const usePagination = () => {
  return useContext(PaginationContext)
}