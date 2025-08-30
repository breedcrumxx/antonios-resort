'use client'

import { message } from 'antd'
import { createContext, useContext, useEffect, useState } from "react"

export const PaginationContext = createContext<any>(null)

export default function PaginationProvider({ children }: { children: React.ReactNode }) {

  const [page, setPage] = useState<number>(1)
  const [maxPage, setMaxPage] = useState<number>(0)
  const [pageRoute, setPageRoute] = useState<string>("")

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(pageRoute, { method: 'GET' })

        if (!response.ok) {
          throw new Error()
        }

        setMaxPage(await response.json())

      } catch (error) {
        message.error("Error getting pages!")
      }
    }

    if (pageRoute.length > 0) {
      fetchData()
    }
  }, [pageRoute])

  return (
    <PaginationContext.Provider value={{
      page,
      setPage,
      maxPage,
      setMaxPage,
      setPageRoute,
    }}>
      {children}
    </PaginationContext.Provider>
  )
}

export const usePagination = () => {
  return useContext(PaginationContext)
}