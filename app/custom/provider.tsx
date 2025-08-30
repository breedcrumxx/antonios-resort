'use client'

import { defaultschedules, extendedpackageoffer, packageoffer, packagetype } from "@/lib/zod/z-schema"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import React, { createContext, useContext, useEffect, useState } from "react"
import { number, z } from "zod"
import { FileState } from "../components/ui/multiimagedropzone"
import { message } from "antd"
import axios from "axios"

type CustomPackageContextType = {
  packageid: string | null | undefined,
  mode: string,
  packageName: string,
  packageDescription: string,
  packageType: string,
  inclusions: string[],
  maxPax: number,
  maxQuantity: number,
  images: FileState[],
  imageUrls: string[],
  schedules: Schedules,
  discount: number,
  setPackageName: React.Dispatch<React.SetStateAction<string>>
  setPackageDescription: React.Dispatch<React.SetStateAction<string>>
  setPackageType: React.Dispatch<React.SetStateAction<string>>,
  setInclusions: React.Dispatch<React.SetStateAction<string[]>>,
  setMaxPax: React.Dispatch<React.SetStateAction<number>>,
  setMaxQuantity: React.Dispatch<React.SetStateAction<number>>,
  setImages: React.Dispatch<React.SetStateAction<FileState[]>>
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>,
  setSchedules: React.Dispatch<React.SetStateAction<Schedules>>,
  setDiscount: React.Dispatch<React.SetStateAction<number>>,
}

export const CustomPackageContext = createContext<CustomPackageContextType>({
  packageid: undefined,
  mode: "create",
  packageName: '',
  packageDescription: '',
  packageType: "",
  inclusions: [],
  maxPax: 0,
  maxQuantity: 0,
  images: [],
  imageUrls: [],
  schedules: {
    day: { timein: "", timeout: "", duration: 5, price: 1000, status: false },
    night: { timein: "", timeout: "", duration: 5, price: 1000, status: false },
    regular: { timein: "", timeout: "", price: 200, status: false },
  },
  discount: 0,
  setPackageName: () => { },
  setPackageDescription: () => { },
  setPackageType: () => { },
  setInclusions: () => { },
  setMaxPax: () => { },
  setMaxQuantity: () => { },
  setImages: () => { },
  setImageUrls: () => { },
  setSchedules: () => { },
  setDiscount: () => { },
})

interface Schedules {
  day: { timein: string, timeout: string, duration: number, price: number, status: boolean },
  night: { timein: string, timeout: string, duration: number, price: number, status: boolean },
  regular: { timein: string, timeout: string, price: number, status: boolean },
}

export default function CustomPackageProvider({
  children,
  packageid,
  scheduleSuggestions,
}: {
  children: React.ReactNode,
  packageid: string | null | undefined,
  scheduleSuggestions: z.infer<typeof defaultschedules>[]
}) {

  // states
  const [mode, setMode] = useState<"create" | "edit">("create")

  // values
  const [packageType, setPackageType] = useState<string>("")
  const [packageName, setPackageName] = useState<string>('')
  const [packageDescription, setPackageDescription] = useState<string>('')
  const [schedules, setSchedules] = useState<Schedules>({
    day: { timein: "", timeout: "", duration: 5, price: 1000, status: false },
    night: { timein: "", timeout: "", duration: 5, price: 1000, status: false },
    regular: { timein: "", timeout: "", price: 200, status: false },
  })
  // const [penaltyAmount, setPenaltyAmount] = useState<number>(0)
  const [inclusions, setInclusions] = useState<string[]>([])
  const [maxPax, setMaxPax] = useState<number>(0)
  const [maxQuantity, setMaxQuantity] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [images, setImages] = useState<FileState[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => { // responseible for loading the package data when update mode
    if (packageid) {
      setMode("edit")

      const packagestring = sessionStorage.getItem("package")
      if (packagestring) {
        const packagedata = JSON.parse(packagestring) as z.infer<typeof extendedpackageoffer>
        setPackageName(packagedata.packagename)
        setPackageDescription(packagedata.packagedescription)
        setSchedules({ day: packagedata.day_tour, night: packagedata.night_tour, regular: packagedata.regular_stay })

        setInclusions(packagedata.inclusion)
        setMaxPax(packagedata.maxpax)
        setMaxQuantity(packagedata.quantity)
        setImageUrls(packagedata.images)
        setPackageType(packagedata.type) // type
        setDiscount(packagedata.discount)
      }
      return
    }

  }, [packageid])

  useEffect(() => {
    if (packageType.length > 0) {
      // load default suggestions
      const day_tour = scheduleSuggestions.find((item) => item.type == packageType && item.slot == "day")
      const night_tour = scheduleSuggestions.find((item) => item.type == packageType && item.slot == "night")
      const regular_stay = scheduleSuggestions.find((item) => item.type == packageType && item.slot == "regular")

      if (day_tour) {
        setSchedules((prev) => ({ ...prev, day: { ...prev.day, timein: day_tour.timein, duration: day_tour.duration } }))
      }
      if (night_tour) {
        setSchedules((prev) => ({ ...prev, night: { ...prev.night, timein: night_tour.timein, duration: night_tour.duration } }))
      }
      if (regular_stay) {
        setSchedules((prev) => ({ ...prev, regular: { ...prev.regular, timein: regular_stay.timein, timeout: regular_stay.timeout, } }))
      }
    }
  }, [packageType])

  return (
    <CustomPackageContext.Provider value={{
      mode,
      packageid,
      packageName,
      packageDescription,
      packageType,
      inclusions,
      maxPax,
      maxQuantity,
      images,
      imageUrls,
      schedules,
      discount,
      setPackageName,
      setPackageDescription,
      setPackageType,
      setInclusions,
      setMaxPax,
      setMaxQuantity,
      setImages,
      setImageUrls,
      setSchedules,
      setDiscount,
    }}>
      <form onSubmit={(e) => e.preventDefault()}>
        {children}
      </form>
    </CustomPackageContext.Provider>
  )
}

export function useCustomPackage() {
  return useContext(CustomPackageContext)
}