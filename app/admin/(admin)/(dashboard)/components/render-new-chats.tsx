'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { defaultprofile } from "@/lib/configs/config-file"
import { discussion } from "@/lib/zod/z-schema"
import { Empty, message } from 'antd'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function RenderNewChats() {

  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  // values
  const [discussions, setDiscussions] = useState<z.infer<typeof discussion>[]>([])

  useEffect(() => { // fetch on Initial load
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/discussion?page=${page}`, { method: 'GET', signal })

        if (!response.ok) {
          throw new Error()
          return
        }

        const result = await response.json()
        setDiscussions(result.data)

      } catch (error) {
        message.error("Error getting messages!")
      }
      setLoading(false)
    }

    fetchData()

    return () => {
      controller.abort();
    }
  }, [page])

  const handleOpenDiscussion = (item: z.infer<typeof discussion>) => {
    router.push(`/admin/inbox/${item.discussionid}`)
  }

  return (
    <div className="flex-grow">
      {
        loading ? (
          <div className="w-full">
            <div
              className="w-full flex gap-2 items-center p-2 rounded-sm cursor-pointer hover:bg-muted relative"
            >
              <div>
                <Skeleton className="bg-gray-500 rounded-full h-[40px] w-[40px] flex items-center justify-center text-white font-bold relative overflow-hidden" />
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-16 h-2" />
              </div>
            </div>
            <div
              className="w-full flex gap-2 items-center p-2 rounded-sm cursor-pointer hover:bg-muted relative"
            >
              <div>
                <Skeleton className="bg-gray-500 rounded-full h-[40px] w-[40px] flex items-center justify-center text-white font-bold relative overflow-hidden" />
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-16 h-2" />
              </div>
            </div>
            <div
              className="w-full flex gap-2 items-center p-2 rounded-sm cursor-pointer hover:bg-muted relative"
            >
              <div>
                <Skeleton className="bg-gray-500 rounded-full h-[40px] w-[40px] flex items-center justify-center text-white font-bold relative overflow-hidden" />
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-16 h-2" />
              </div>
            </div>
          </div>
        ) : discussions.length == 0 ? (
          <Empty
            description="No messages" />
        ) : (
          <>
            {
              discussions.map((item, i) => (
                <div
                  className="w-full flex gap-2 items-center p-2 rounded-sm cursor-pointer hover:bg-muted relative"
                  onClick={() => handleOpenDiscussion(item)}
                  key={i}
                >
                  <div>
                    <div className="bg-gray-500 rounded-full h-[40px] w-[40px] flex items-center justify-center text-white font-bold relative overflow-hidden">
                      <Image
                        fill
                        src={item.user?.image || defaultprofile}
                        alt="profile-picture"
                        className=""
                      />
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <p className="text-sm font-semibold">{item.user?.firstname ? (item.user.firstname + " " + item.user.lastname) : `Guest #${item.discussionid.slice(-8)}`}</p>
                    <p className="text-xs">{item.status}</p>
                  </div>
                </div>
              ))
            }
          </>
        )
      }
    </div>
  )
}