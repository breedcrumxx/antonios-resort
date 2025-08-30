'use client'

import { months } from "@/lib/utils/month-filter-utils"
import { createContext, useContext, useState } from "react"

export const FilterProviderContext = createContext<any>(null)

export default function FilterProvider({ children }: { children: React.ReactNode }) {

  const selected = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const getdates = { start: selected, end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) }

  let comparedates = { start: new Date(), end: new Date() }
  if (selected.getMonth() == 0) {
    comparedates = { start: new Date(new Date().getFullYear(), -1, 1), end: new Date(new Date().getFullYear(), 0, 0) }
  } else {
    comparedates = { start: new Date(new Date().getFullYear(), selected.getMonth() - 1, 1), end: new Date(new Date().getFullYear(), selected.getMonth(), 0) }
  }

  const [filter, setFilter] = useState<FilterDateObject>({ get: getdates, compare: comparedates })

  const filters = ["All", ...months]

  return (
    <FilterProviderContext.Provider value={{
      filter,
      filters,
      setFilter,
    }}>
      {children}
    </FilterProviderContext.Provider>
  )
}

export const useFilter = () => {
  return useContext(FilterProviderContext)
}