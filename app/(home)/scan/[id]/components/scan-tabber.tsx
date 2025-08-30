'use client'

import { Tabs } from "@/app/components/ui/tabs"
import { useTabs } from "../../../../providers/tab-provider"

export default function ScanTabber({ children }: { children: React.ReactNode }) {

  const { tab } = useTabs()

  return (
    <Tabs value={tab}>
      {children}
    </Tabs>
  )
}