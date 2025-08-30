'use client'

import { chat } from "@/lib/zod/z-schema"
import React, { createContext, useContext, useEffect, useState } from "react"
import { z } from "zod"

type DialogContextType = {
  dialogs: z.infer<typeof chat>[],
  setDialogs: React.Dispatch<React.SetStateAction<z.infer<typeof chat>[]>>
}

export const DialogContext = createContext<DialogContextType>({
  dialogs: [],
  setDialogs: () => { }
})

export default function DialogContextProvider({ children }: { children: React.ReactNode }) {

  const [dialogs, setDialogs] = useState<z.infer<typeof chat>[]>([])

  useEffect(() => {
    if (dialogs.length > 0) {    // if there are contents, save
      const stringDialogs = JSON.stringify(dialogs)

      sessionStorage.setItem("conversation", stringDialogs)
    } else {     // if there are no content, read
      const stringDialogs = sessionStorage.getItem('conversation')

      if (stringDialogs) {
        setDialogs(JSON.parse(stringDialogs))
      }
    }
  }, [dialogs])

  return (
    <DialogContext.Provider value={{
      dialogs,
      setDialogs,
    }}>
      {children}
    </DialogContext.Provider>
  )
}

export const useDialogs = () => {
  return useContext(DialogContext)
}