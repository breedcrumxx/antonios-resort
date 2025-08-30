'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { getCollections } from "@/lib/actions/gallery-actions/gallery-actions"
import { EdgeStoreProvider } from "@/lib/edgestore"
import { collection } from "@/lib/zod/z-schema"
import { Empty, message } from "antd"
import { useEffect, useState } from "react"
import { z } from "zod"
import AddCollection from "./add-collection"
import CollectionCard from "./collection-card"

export default function Collections({ user }: { user: UserSession | null }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [data, setData] = useState<z.infer<typeof collection>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCollections()
        setLoading(false)

        if (response.status == 500) throw new Error()

        setData(response.data)
      } catch (error) {
        message.error("Unable to get the collections!")
      }
    }

    fetchData()
  }, [])

  return (
    <>
      {
        user?.role?.websitecontrol && (
          <EdgeStoreProvider>
            <AddCollection />
          </EdgeStoreProvider>
        )
      }
      {
        loading ? (
          <>
            {
              user?.role?.websitecontrol ? (
                <></>
              ) : (
                <div className="h-[400px] sm:h-auto flex flex-col border rounded-lg p-4 space-y-4">
                  <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
                    <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                    <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                    <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                    <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="bg-gray-500 w-1/2 h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
              )
            }
            <div className="h-[400px] sm:h-auto flex flex-col border rounded-lg p-4 space-y-4">
              <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
                <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="bg-gray-500 w-1/2 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            </div>
            <div className="h-[400px] sm:h-auto flex flex-col border rounded-lg p-4 space-y-4">
              <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
                <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="w-full sm:h-[300px] sm:h-auto sm:w-auto" />
                <Skeleton className="bg-gray-500 w-full sm:h-[300px] sm:h-auto sm:w-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="bg-gray-500 w-1/2 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            </div>
          </>
        ) : (
          <>
            {
              data.length == 0 && !user?.role?.websitecontrol && (
                <div className="col-span-3 flex items-center justify-center">
                  <Empty description="No collections yet..." />
                </div>
              )
            }
            {
              data.map((item, i) => (
                <CollectionCard
                  item={item}
                  key={i}
                />
              ))
            }
          </>
        )
      }
    </>
  )
}