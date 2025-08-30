'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent } from "@/app/components/ui/dialog"
import { SingleImageDropzone } from "@/app/components/upload-dropdown/image-dropzone"
import { cn } from "@/lib/utils/cn"
import { chat, discussion } from "@/lib/zod/z-schema"
import { message } from "antd"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import z from 'zod'
import { sendImageAttachment } from "../discussion-actions/send-client-message"
import { socket } from "@/lib/sockets"
import { message as amessage } from 'antd'
import { sendStaticMessage } from "@/lib/actions/discussion-actions/allow-chat"

export default function AttachmentExtension({ open, close, currentDiscussion, className, setMessages, sender }: {
  open: boolean,
  close: () => void,
  sender: string,
  currentDiscussion: z.infer<typeof discussion>,
  setMessages: React.Dispatch<React.SetStateAction<z.infer<typeof chat>[]>>
  className?: string,
}) {

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [mode, setMode] = useState<"static" | "socket">("socket")

  // values
  const [file, setFile] = useState<string>("");

  useEffect(() => { // fetch on Initial load
    socket.connect()

    socket.on("status", (response) => {
      if (response.code == 500) {
        setMessages((prev) => ([...prev.map((item) => {
          if (item.date == response.data.date) {
            return { ...item, status: "failed" }
          }
          return item
        })]))
        return
      }
    })

    socket.on("reconnect_failed", () => { // on failure, set the mode to static
      amessage.error("Unable to connect to sockets! Switching to static.")
      setMode("static")
      socket.off("status")
    });

    return () => {
      socket.disconnect();
    }
  }, [])


  const handleImageFile = async (image: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = function () {
      setFile(reader.result as string)
    };
    reader.onerror = function (error) {
      message.error("Unable to get the file!")
    };
  }

  const sendImage = async () => {
    setLoading(true)

    const myMessage: z.infer<typeof chat> = {
      discussionid: currentDiscussion.id,
      id: "",
      date: new Date().getTime(),
      seen: false,
      status: "sending",
      type: "attachment",
      sender: sender,
      content: "empty",
    }

    setMessages((prev) => ([...prev, myMessage]))

    const response = await sendImageAttachment(currentDiscussion.id, file)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured, cannot send the attachment...")
      setMessages((prev) => ([...prev.map((item) => {
        if (item.date == myMessage.date) {
          return { ...item, status: "failed" }
        }
        return item
      })]))
      return
    }

    if (mode == "socket") {
      socket.emit('message', { ...myMessage, content: response.data as string });
    } else {
      const response = await sendStaticMessage(myMessage)

      if (response.status == 500) {
        setMessages((prev) => ([...prev.map((item) => {
          if (item.date == response.data) {
            return { ...item, status: "failed" }
          }
          return item
        })]))
        return
      } else {
        setMessages((prev) => ([...prev.map((item) => {
          if (item.date == response.data) {
            return { ...item, status: "sent" }
          }
          return item
        })]))
      }
    }
    setFile('');
    close()


  }

  return (
    <Dialog open={open} onOpenChange={(e) => {
      if (loading) return
      close()
    }}>
      <DialogContent className="flex flex-col items-center"
        disableclose={loading}
      >
        <SingleImageDropzone
          className="w-full"
          width={300}
          height={200}
          value={file}
          onChange={(file) => {
            if (file == undefined) {
              setFile("")
              return
            }
            handleImageFile(file as File);
          }}
          disabled={loading}
        />
        <Button
          className={cn("bg-prm", className)}
          onClick={() => sendImage()}
          disabled={loading}>{loading ? "Sending" : "Send"}</Button>
      </DialogContent>
    </Dialog>
  )
}