'use client'

import { createContext, useContext, useState } from "react"
import { Tabs } from "../components/ui/tabs"

type TabsProviderType = {
  tab: string
  setTab: React.Dispatch<React.SetStateAction<string>>
}

export const TabsContext = createContext<TabsProviderType>({
  tab: "",
  setTab: () => { }
})

export default function TabsProvider({ children }: { children: React.ReactNode }) {

  // states
  const [tab, setTab] = useState<string>("default")

  return (
    <TabsContext.Provider value={{
      tab,
      setTab,
    }}>
      {children}
    </TabsContext.Provider>
  )

}

export function Tabber({ children }: { children: React.ReactNode }) {

  const { tab } = useTabs()

  return (
    <Tabs value={tab}>
      {children}
    </Tabs>
  )
}

export const useTabs = () => {
  return useContext(TabsContext)
}