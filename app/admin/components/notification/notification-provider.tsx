'use client'

import { getNotifications } from "@/lib/actions/system-actions/notification-actions"
import { notification } from "@/lib/zod/z-schema"
import { createContext, useContext, useEffect, useState } from "react"
import { z } from "zod"

type NotificationContextType = {
  open: boolean,
  page: number,
  maxPage: number,
  notifications: z.infer<typeof notification>[],
  loading: boolean,
  tab: string,
  type: string,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  setMaxPage: React.Dispatch<React.SetStateAction<number>>,
  setTab: React.Dispatch<React.SetStateAction<string>>,
}

export const NotificationContext = createContext<NotificationContextType>({
  open: false,
  page: 1,
  maxPage: 1,
  notifications: [],
  loading: false,
  tab: "",
  type: "",
  setOpen: () => { },
  setPage: () => { },
  setMaxPage: () => { },
  setTab: () => { },
})

export default function NotificationProvider({ children, type }: { children: React.ReactNode, type: string }) {

  //states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [maxPage, setMaxPage] = useState<number>(1)
  const [tab, setTab] = useState<string>("All")

  // values
  const [notifications, setNotifications] = useState<z.infer<typeof notification>[]>([])

  useEffect(() => {

    const loadNotifications = async (page: number) => {
      const response = await getNotifications(type, page, tab);
      setLoading(false)

      if (response.status == 500) {
        return
      }

      setMaxPage(response.maxPage as number)
      setNotifications((prev) => [...response.data as z.infer<typeof notification>[]]);
    };

    if (page == 1) {
      setLoading(true)
    }
    loadNotifications(page);

  }, [page, tab]);

  return (
    <NotificationContext.Provider value={{
      open,
      page,
      maxPage,
      notifications,
      tab,
      loading,
      type,
      setOpen,
      setPage,
      setMaxPage,
      setTab,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  return useContext(NotificationContext)
}