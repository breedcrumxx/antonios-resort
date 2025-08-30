'use client'

import { discussion } from "@/lib/zod/z-schema"
import React, { createContext, useContext, useEffect, useState } from "react"
import { closeCurrentDiscussion, getDiscussion } from "../discussion-actions/discussion-action"
import { z } from "zod"
import { message } from "antd"

type DiscussionContextType = {
  discussionid: string,
  setDiscussionId: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<number>>,
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>,
  setDataDiscussion: React.Dispatch<React.SetStateAction<z.infer<typeof discussion> | null>>,
  setClosing: React.Dispatch<React.SetStateAction<boolean>>,
  dataDiscussion: z.infer<typeof discussion> | null,
  loading: boolean,
  refetch: boolean,
  closing: boolean,
  error: number,
}

export const DiscussionContext = createContext<DiscussionContextType>({
  discussionid: "",
  setDiscussionId: () => { },
  setRefetch: () => { },
  setError: () => { },
  setClosing: () => { },
  setDataDiscussion: () => { },
  dataDiscussion: null,
  error: 0,
  loading: true,
  closing: false,
  refetch: true,
})

export default function DiscussionProvider({ children, givenid }: { children: React.ReactNode, givenid?: string }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<number>(0)
  const [refetch, setRefetch] = useState<boolean>(false)
  const [closing, setClosing] = useState<boolean>(false)

  // values
  const [discussionid, setDiscussionId] = useState<string>(givenid || "")
  const [dataDiscussion, setDataDiscussion] = useState<z.infer<typeof discussion> | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await getDiscussion(discussionid)
      setLoading(false)
      if (response.status == 200) {
        setDataDiscussion(response.data as unknown as z.infer<typeof discussion>)
      } else {
        setError(response.status)
      }
    }

    if (discussionid.length > 0) {
      fetchData()
    }
  }, [discussionid])

  useEffect(() => {
    const closeDiscussion = async (id: string) => {
      const response = await closeCurrentDiscussion(id)
      setClosing(false)
      if (response.status == 500) {
        message.error("Unable to close this discussion!")
        return
      }
      setDiscussionId(discussionid)
    }

    if (closing && dataDiscussion) {
      closeDiscussion(dataDiscussion.id)
    } else {
      setClosing(false)
    }
  }, [closing])

  return (
    <DiscussionContext.Provider value={{
      discussionid,
      setDiscussionId,
      dataDiscussion,
      error,
      setError,
      loading,
      refetch,
      setRefetch,
      closing,
      setClosing,
      setDataDiscussion,
    }}>
      {children}
    </DiscussionContext.Provider>
  )
}

export const useDiscussion = () => {
  return useContext(DiscussionContext)
}