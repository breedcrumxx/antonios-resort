'use client'

import React from "react"
import { Tabs } from "../../components/ui/tabs"
import { useCheckout } from "../provider"

export default function Tabber({ children }: { children: React.ReactNode }) {

  const { tab } = useCheckout()

  return (
    <Tabs value={tab}>
      {children}
    </Tabs>
  )
}