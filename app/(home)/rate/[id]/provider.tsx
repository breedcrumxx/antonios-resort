'use client'

import { Tabs } from "@/app/components/ui/tabs"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { extendedpackageoffer, ratinglink } from "@/lib/zod/z-schema"
import { useRouter } from "next/navigation"
import React, { createContext, useContext, useEffect, useState } from "react"
import z from 'zod'

type RatingContextType = {
  setTab: React.Dispatch<React.SetStateAction<string>>
  setPackagerate: React.Dispatch<React.SetStateAction<PackageRateType>>
  packagedata: z.infer<typeof extendedpackageoffer> | null
  packagerate: PackageRateType,
  rateErrors: RateErrorType,
  setRateErrors: React.Dispatch<React.SetStateAction<RateErrorType>>,
  ratingData: z.infer<typeof ratinglink> | null,
}

export const RatingContext = createContext<RatingContextType>({
  setTab: () => { },
  packagedata: null,
  packagerate: {
    experience: 0,
    facility: 0,
    cleanliness: 0,
    service: 0,
    personalfeedback: "",
  },
  setPackagerate: () => { },
  rateErrors: {
    experience: false,
    facility: false,
    cleanliness: false,
    service: false,
    personalfeedback: false,
  },
  setRateErrors: () => { },
  ratingData: null,
})

export default function RatingContextProvider({
  children,
  data,
  userid
}: {
  children: React.ReactNode,
  data: z.infer<typeof ratinglink>,
  userid: string
}) {

  const { dev } = useDevs()
  const router = useRouter()

  // states
  const [tab, setTab] = useState<string>("default")
  const [rateErrors, setRateErrors] = useState<RateErrorType>({
    experience: false,
    facility: false,
    cleanliness: false,
    service: false,
    personalfeedback: false,
  })

  // values 
  const [ratingData, setRatingData] = useState<z.infer<typeof ratinglink>>(data)
  const [packagedata, setPackagedata] = useState<z.infer<typeof extendedpackageoffer> | null>(null)
  const [packagerate, setPackagerate] = useState<PackageRateType>({
    experience: 0,
    facility: 0,
    cleanliness: 0,
    service: 0,
    personalfeedback: "",
  })

  useEffect(() => {

    // redirect to success tab if already used
    if (data.used) {
      setTab("success")
    }

    if (!dev.DEBUG && data.booking.clientid != userid) {
      router.push("/restricted")
    }

    setPackagedata(JSON.parse(data.booking.packagedata))
  }, [data])

  return (
    <RatingContext.Provider value={{
      setTab,
      packagedata,
      packagerate,
      setPackagerate,
      rateErrors,
      setRateErrors,
      ratingData,
    }}>
      <Tabs value={tab}>
        {children}
      </Tabs>
    </RatingContext.Provider>
  )
}

export const useRating = () => {
  return useContext(RatingContext)
}