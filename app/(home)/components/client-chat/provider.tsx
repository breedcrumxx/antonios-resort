'use client'

import { bookingdata, discussion } from "@/lib/zod/z-schema"
import React, { createContext, useContext, useEffect, useState } from "react"
import { z } from "zod"
import { getDiscussion } from "./discussion-actions/discussion-action"

type ChatContextType = {
  open: boolean,
  operation: string,
  loading: boolean,
  error: number,
  booking: z.infer<typeof bookingdata> | null,
  discussionid: string,
  dataDiscussion: z.infer<typeof discussion> | null,

  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setOperation: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<number>>,
  setBooking: React.Dispatch<React.SetStateAction<z.infer<typeof bookingdata> | null>>,
  setDiscussionid: React.Dispatch<React.SetStateAction<string>>,
  setDataDiscussion: React.Dispatch<React.SetStateAction<z.infer<typeof discussion> | null>>
}

export const ChatContext = createContext<ChatContextType>({
  open: false,
  operation: "",
  loading: false,
  error: 0,
  booking: null,
  discussionid: "",
  dataDiscussion: null,

  setOpen: () => { },
  setOperation: () => { },
  setLoading: () => { },
  setError: () => { },
  setBooking: () => { },
  setDiscussionid: () => { },
  setDataDiscussion: () => { },
})

export default function ChatContextProvider({ children }: { children: React.ReactNode }) {

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [operation, setOperation] = useState<string>("default")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<number>(0)
  const [closing, setClosing] = useState<boolean>(false)

  // values
  const [booking, setBooking] = useState<z.infer<typeof bookingdata> | null>(null)
  const [discussionid, setDiscussionid] = useState<string>("")
  const [dataDiscussion, setDataDiscussion] = useState<z.infer<typeof discussion> | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await getDiscussion(discussionid)
      console.log(response)
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

  return (
    <ChatContext.Provider value={{
      open,
      operation,
      loading,
      error,
      booking,
      discussionid,
      dataDiscussion,

      setOpen,
      setOperation,
      setLoading,
      setError,
      setBooking,
      setDiscussionid,
      setDataDiscussion,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  return useContext(ChatContext)
}