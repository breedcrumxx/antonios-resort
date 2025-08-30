'use client'

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { sendStaticMessage } from "@/lib/actions/discussion-actions/allow-chat";
import { socket } from "@/lib/sockets";
import { chat } from "@/lib/zod/z-schema";
import { Spinner } from "@nextui-org/spinner";
import { message as amessage } from 'antd';
import clsx from "clsx";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getDiscussionMessages } from "../discussion-actions/discussion-action";
import { useChat } from "../provider";
import AttachmentExtension from "./attachment-extension";
import React from "react";

export default function DiscussionExtension({ user }: { user: UserSession | null }) {

  const { dataDiscussion, loading, error, setError } = useChat()

  // states
  const [fetching, setFetching] = useState<boolean>(true)
  const [openAttachment, setOpenAttachment] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [mode, setMode] = useState<"static" | "socket">("socket")

  // values
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<z.infer<typeof chat>[]>([])

  const fetchData = async (id: string) => {
    const response = await getDiscussionMessages(id, page)
    setFetching(false)

    if (response.status === 500 || response.status === 404) {
      setError(response.status)
      return
    }
    if (response.status == 200) {
      setMessages(response.data)
      setHasMore(response.hasmore)
    }
  }

  useEffect(() => {
    if (dataDiscussion) {
      socket.connect()
    }

    socket.on("connect", () => { // join the room
      console.log("connected!", socket.connected)
      socket.emit("room", dataDiscussion?.discussionid as string)
    })

    socket.on("joined", () => { // confirm joining
      console.log("Joined!")
      // setReady(true)
    })

    socket.on("update", (response) => {
      console.log("Updating messages...")
      setMessages((prev) => ([...prev.filter((item) => item.date != response.date), { ...response, status: "sent" }]))
    })

    socket.on("status", (response) => {
      if (response.code == 500) { // updating the message to failed!
        setMessages((prev) => ([...prev.map((item) => {
          if (item.date == response.data.date) {
            return { ...item, status: "failed" }
          }
          return item
        })]))
        return
      }
    })

    socket.io.on("reconnect_failed", () => { // on failure, set the mode to static
      setMode("static")
      // setReady(true)
    });

    return () => {
      console.log("unmounting...")
      socket.disconnect();
    }
  }, [dataDiscussion])

  useEffect(() => { // fetch on Initial load
    if (dataDiscussion) {
      setFetching(true)
      fetchData(dataDiscussion.id)
    }

  }, [dataDiscussion, page])

  const send = async () => {

    if (!dataDiscussion) {
      amessage.error("Unknown error occured!")
      return
    }

    const content = message
    setMessage("")

    const myMessage: z.infer<typeof chat> = {
      discussionid: dataDiscussion.id,
      id: "",
      date: new Date().getTime(),
      seen: false,
      status: "sending",
      type: "message",
      sender: "Client",
      content: content,
    }

    setMessages((prev) => ([...prev, myMessage]))

    if (mode == "socket") {
      socket.emit('message', { message: myMessage, room: dataDiscussion.discussionid });
      setMessage('');
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
        fetchData(dataDiscussion.id)
      }
    }

  }

  return (
    <>
      <div className="w-full h-[60vh] py-2 bg-white">
        {
          loading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner label="Loading..." />
            </div>
          ) : error == 500 ? (
            <div className="w-full h-full flex justify-center items-center">
              <p>An error occured while getting chats</p>
            </div>
          ) : error == 404 ? (
            <div className="w-full h-full flex justify-center items-center">
              <p>We cannot find your discussion...</p>
            </div>
          ) : fetching ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner label="Loading, messages..." />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col px-2 overflow-y-scroll scroll">
              {
                hasMore ? (
                  <div className="w-full flex flex-col items-center mt-5">
                    <p className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => setPage((prev) => prev + 1)}>Load more</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center mt-5">
                    <div className="w-[50px] h-[50px] bg-gray-500 rounded-[150px]"></div>
                    <p className="font-semibold text-sm">AR Assistant</p>
                  </div>
                )
              }
              <br />

              <div key={`container-1`}>
                {messages.sort((a, b) => a.date - b.date)?.map((item, i: number) => (
                  <>
                    {
                      item.type == "message" ? (
                        <div key={`main-${i}`} className={item.sender === "Admin" ? "chat chat-start" : "chat chat-end"}>
                          <div className={clsx("chat-bubble before:w-0 rounded-lg max-w-[70%] text-sm min-h-[0px]", {
                            "text-black bg-white border": item.sender === "Admin",
                            "text-white": item.sender == "Client"
                          })}>
                            {item.content}
                            {
                              item.status == "sending" ? (
                                <div className="chat-footer">
                                  <time className="text-xs opacity-50">Sending</time>
                                </div>
                              ) : item.status == "failed" ? (
                                <div className="chat-footer">
                                  <time className="text-xs opacity-50">failed</time>
                                </div>
                              ) : item.status == "sent" && (
                                <div className="chat-footer">
                                  <time className="text-xs opacity-50">Sent {new Date(item.date).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) ? format(item.date, "hh:mm a") : format(item.date, "PPP hh:mm a")}</time>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      ) : item.type == "attachment" ? (
                        <a target="_blank" href={item.content}>
                          <div key={`attachment-${i}`} className={item.sender === "Admin" ? "chat chat-start" : "chat chat-end"}>
                            <div className={clsx("chat-bubble before:w-0 rounded-lg max-w-[70%] text-sm min-h-[0px]", {
                              "text-black bg-white border": item.sender === "Admin",
                              "text-white": item.sender == "Client"
                            })}>
                              <div className="flex gap-2 items-end">
                                <Paperclip className="w-4 h-4" />
                                <span>Image attachment</span>
                              </div>
                              <div className="chat-footer">
                                <time className="text-xs opacity-50">Sent {new Date(item.date).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) ? format(item.date, "hh:mm a") : format(item.date, "PPP hh:mm a")}</time>
                              </div>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <p
                          key={`system-${i}`}
                          className={clsx("text-center text-xs px-4 py-2", { "hidden": item.sender == "Admin" })}
                        >{item.content}</p>
                      )
                    }
                  </>
                ))}
              </div>
            </div>
          )
        }
      </div>
      {
        dataDiscussion && (
          <AttachmentExtension
            open={openAttachment}
            sender={"Client"}
            close={() => setOpenAttachment(false)}
            currentDiscussion={dataDiscussion}
            setMessages={setMessages}
          />
        )
      }

      <div className="w-full flex gap-2 p-2 pt-0">
        <Button variant={"ghost"} className="w-max"
          onClick={() => setOpenAttachment(true)}
          disabled={!dataDiscussion || !dataDiscussion.allowinteract}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          placeholder="Chat here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.code == 'Enter' && message.length > 0) {
              send()
            } else {
              return e
            }
          }}
          disabled={!dataDiscussion || !dataDiscussion.allowinteract}
        />
      </div>
    </>
  )
}