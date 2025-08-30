'use client'

import { extendedpackageoffer } from '@/lib/zod/z-schema'
import { message } from 'antd'
import axios, { AxiosError } from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'
import z from 'zod'

type PackageDataContextType = {
  packagedata: z.infer<typeof extendedpackageoffer> | null
  loading: boolean
}

export const PackageDataContext = createContext<PackageDataContextType>({
  packagedata: null,
  loading: true
})

export default function PackageDataProvider({ children, packageid }: { children: React.ReactNode, packageid?: string }) {

  const [packagedata, setPackageData] = useState<z.infer<typeof extendedpackageoffer> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/packages/offers/${packageid}`)
        setPackageData(response.data)

        // load the data to the local storage
        const stringpackage = JSON.stringify(response.data)
        sessionStorage.setItem('package', stringpackage)

        setLoading(false)

      } catch (error) {
        console.log(error)
        if (error instanceof AxiosError) {
          message.error(error.response?.statusText)
        } else message.error("Unknown error occured, please try again later.")
      }
    }

    const item = sessionStorage.getItem('package')

    // check the sessionstorage
    if (!item) { // if the package didnt exist, then fetch the data
      fetchData()
    } else { // if the data is in local storage, load it
      const cachedpackage = JSON.parse(item)
      if (cachedpackage.id != packageid) { // if the id in the link is not equal to the cached, fetch the cached
        fetchData()
      } else { // else load the data from cache
        setPackageData(cachedpackage)
        setLoading(false)
      }
    }
  }, [])

  return (
    <PackageDataContext.Provider value={{
      packagedata,
      loading
    }}>
      {children}
    </PackageDataContext.Provider>
  )
}

export const usePackageData = () => {
  return useContext(PackageDataContext)
}