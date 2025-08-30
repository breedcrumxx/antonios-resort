'use client'

import { Input } from "@/app/components/ui/input"
import { Separator } from "@/app/components/ui/separator"
import { Skeleton } from "@/app/components/ui/skeleton"
import { defaultprofile } from "@/lib/configs/config-file"
import { socket } from '@/lib/sockets'
import { useDebounce } from "@/lib/utils/debounce"
import { discussion } from "@/lib/zod/z-schema"
import { Empty, message } from "antd"
import clsx from "clsx"
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import z from 'zod'

export default function ChatInbox() {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  // values
  const [searchvalue, setSearchValue] = useState<string>("")
  const [discussions, setDiscussions] = useState<z.infer<typeof discussion>[]>([])
  const [hasmore, setHasmore] = useState<boolean>(false)

  const searchValue = useDebounce(searchvalue, 500)

  useEffect(() => { // fetch on Initial load

    socket.connect();

    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/discussion?page=${page}&search=${searchValue}`, { method: 'GET', signal })

        if (!response.ok) {
          throw new Error()
          return
        }

        const result = await response.json()
        setDiscussions(result.data)
        setHasmore(result.hasmore)

      } catch (error) {
        message.error("Error getting messages!")
      }
      setLoading(false)
    }

    socket.on("changes", () => {
      fetchData()
    })

    fetchData()

    return () => {
      controller.abort();
      socket.off("changes")
      socket.disconnect();
    }
  }, [page, searchValue])

  const handleOpenDiscussion = (item: z.infer<typeof discussion>) => {
    router.push(`/admin/inbox/${item.discussionid}`)
  }

  return (
    <>
      <div className="p-2">
        <Input placeholder="Search discussion ID or user email..." onChange={(e) => setSearchValue(e.target.value)} />
      </div>
      <Separator className="mb-2" />
      {
        loading ? (
          <div className="w-full space-y-2">
            <div className="w-full flex gap-2 p-2">
              <div>
                <Skeleton className="h-[50px] w-[50px] rounded-full bg-gray-500" />
              </div>
              <div className="flex-grow flex flex-col space-y-2 justify-center">
                <Skeleton className="h-4 w-full bg-gray-400" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            </div>
            <div className="w-full flex gap-2 p-2 ">
              <div>
                <Skeleton className="h-[50px] w-[50px] rounded-full bg-gray-500" />
              </div>
              <div className="flex-grow flex flex-col space-y-2 justify-center">
                <Skeleton className="h-4 w-full bg-gray-400" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            </div>
            <div className="w-full flex gap-2 p-2 ">
              <div>
                <Skeleton className="h-[50px] w-[50px] rounded-full bg-gray-500" />
              </div>
              <div className="flex-grow flex flex-col space-y-2 justify-center">
                <Skeleton className="h-4 w-full bg-gray-400" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            </div>
          </div>
        ) : discussions.length == 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <Empty
              description="No open discussions..."
            />
          </div>
        ) : (
          <div className="flex-grow overflow-y-scroll scroll space-y-2">
            {
              discussions.map((item, i) => (
                <div
                  className="w-full flex gap-2 items-center p-2 rounded-sm cursor-pointer hover:bg-muted relative"
                  onClick={() => handleOpenDiscussion(item)}
                  key={i}
                >
                  {/* <Badge count={item.chats.length} className={clsx("absolute right-5 top-1/2 -translate-y-2/4", { "hidden": item.chats.length == 0 })} key={`badge-${i}`}>
                  </Badge> */}
                  <div>
                    <div className="bg-gray-500 rounded-full h-[50px] w-[50px] flex items-center justify-center text-white font-bold relative overflow-hidden">
                      <Image
                        fill
                        src={item.user?.image || defaultprofile}
                        alt="profile-picture"
                        className=""
                      />
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <p className="text-md font-semibold">{item.user?.firstname ? (item.user.firstname + " " + item.user.lastname) : `Guest #${item.discussionid.slice(-8)}`}</p>
                    <p className={clsx("text-xs", { "text-yellow-500": item.status == "Pending", "text-blue-500": item.status == "On-process" })}>{item.status}</p>
                  </div>
                </div>
              ))
            }
            {
              hasmore && (
                <div className="w-full py-2 text-center text-sm hover:bg-muted/30 hover:underline cursor-pointer" onClick={() => setPage((prev) => prev + 1)}>
                  Load more
                </div>
              )
            }
          </div>
        )
      }
    </>
  )
}