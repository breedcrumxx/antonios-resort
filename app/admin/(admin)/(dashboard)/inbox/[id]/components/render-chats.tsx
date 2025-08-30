'use client'

import { closeCurrentDiscussion, getDiscussion, getDiscussionMessages, markDiscussionAsRefunded } from "@/app/(home)/components/client-chat/discussion-actions/discussion-action";
import AttachmentExtension from "@/app/(home)/components/client-chat/extensions/attachment-extension";
import FullBookingDetails from "@/app/admin/components/bookings-feature/full-booking-details";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { allowChat, sendStaticMessage } from "@/lib/actions/discussion-actions/allow-chat";
import { defaultprofile } from "@/lib/configs/config-file";
import { socket } from '@/lib/sockets';
import CoolDownDialog from "@/lib/utils/cooldown-dialog";
import FullCoverLoading from "@/lib/utils/full-cover-loading";
import { chat, discussion } from "@/lib/zod/z-schema";
import { Spinner } from "@nextui-org/spinner";
import { message as amessage } from 'antd';
import clsx from "clsx";
import { format } from "date-fns";
import { MoreHorizontal, Paperclip, SendHorizontal } from "lucide-react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import LoadingCurtain from "../../../analytics/components/loading-curtain";
import { useToast } from "@/app/components/ui/use-toast";
import { useZoom } from "../../../bookings/booking-components/zoomer-provider";

export default function RenderChats({ discussionid }: { discussionid: string }) {

  const router = useRouter()
  const { toast } = useToast()
  const { zoom } = useZoom()

  // states
  const [processing, setProcessing] = useState<boolean>(false)
  const [openAttachment, setOpenAttachment] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [mode, setMode] = useState<"static" | "socket">("socket")
  const [ready, setReady] = useState<boolean>(false)

  const [fetchingDiscussion, setFetchingDiscussion] = useState<boolean>(true)
  const [fetchingMessages, setFetchingMessages] = useState<boolean>(true)

  const [openModal, setOpenModal] = useState<boolean>(false)
  const [operation, setOperation] = useState<string>("")

  // values 
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<z.infer<typeof chat>[]>([])
  const [currentDiscussion, setCurrentDiscussion] = useState<z.infer<typeof discussion> | null>(null)

  const fetchMessages = async (id: string) => {
    const response = await getDiscussionMessages(id, page)
    setFetchingMessages(false)

    if (response.status === 500 || response.status === 404) {
      amessage.error("Unable to get the messages!")
      return
    }
    if (response.status == 200) {
      setMessages([...response.data])
      setHasMore(response.hasmore)
    }
  }

  const fetchDiscussion = async () => {
    const response = await getDiscussion(discussionid)
    setFetchingDiscussion(false)

    if (response.status == 200) {
      setCurrentDiscussion(response.data as unknown as z.infer<typeof discussion>)
    } else {
      amessage.error("Cannot open the discussion, please try again later!")
    }
  }

  useEffect(() => {
    if (currentDiscussion) {
      fetchMessages(currentDiscussion.id)
    }
  }, [page, currentDiscussion])

  useEffect(() => { // fetch data discussion on initial load
    fetchDiscussion()

    socket.connect()

    socket.on("connect", () => { // join the room
      console.log("connected!", socket.connected)
      socket.emit("room", discussionid)
    })

    socket.on("joined", () => { // confirm joining
      console.log("Joined!")
      setReady(true)
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
      amessage.error("Unable to connect to sockets, switching to static!")
      setMode("static")
      setReady(true)
    });

    return () => {
      console.log("unmounting...")
      socket.disconnect();
    }
  }, [])

  const send = async () => {

    if (!currentDiscussion) {
      amessage.error("Unknown error occured!")
      return
    }

    const content = message
    setMessage("")

    const myMessage: z.infer<typeof chat> = {
      discussionid: currentDiscussion.id,
      id: "",
      date: new Date().getTime(),
      seen: false,
      status: "sending",
      type: "message",
      sender: "Admin",
      content: content,
    }

    setMessages((prev) => ([...prev, myMessage]))

    if (!currentDiscussion.allowinteract) {
      const response = await allowChat(currentDiscussion.id)

      if (response.status == 500) {
        amessage.error("Unable to allow the user to chat, please try again later!")
        return
      }

      setCurrentDiscussion((prev) => ({ ...prev as z.infer<typeof discussion>, status: "On-process", allowinteract: true }))

    }

    if (mode == "socket") {
      socket.emit('message', { message: myMessage, room: discussionid });
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
        fetchMessages(currentDiscussion.id)
      }
    }

  }

  const handleSetOperation = (op: string) => {
    setOperation(op)
    setOpenModal(true)
  }

  const closeDiscussion = async () => {
    if (!currentDiscussion) {
      amessage.error("Unknown error occured!")
      return
    }

    setProcessing(true)
    const response = await closeCurrentDiscussion(currentDiscussion.id, "Admin")
    setProcessing(false)

    if (response.status == 500) {
      toast({
        title: "Unable to close the discussion!",
        description: "An error occured while attempting to close the discussion.",
        variant: "destructive"
      })

      return
    }

    toast({
      title: "Closed a discussion!",
      description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
      variant: "destructive"
    })

    if (socket) {
      socket.emit("changes")
    }

    router.push("/admin/inbox")

  }

  const markAsRefunded = async (close: boolean) => {
    if (!currentDiscussion) {
      amessage.error("Unknown error occured!")
      return
    }

    setProcessing(true)
    const response = await markDiscussionAsRefunded(currentDiscussion.id, currentDiscussion.bookingid)
    setProcessing(false)

    if (response.status == 500) {
      amessage.error("An error occured, we cannot processing your request!")
      return
    }
    if (response.status == 404) {
      amessage.error("Your data went missing, please try again later!")
      return
    }

    fetchDiscussion()
  }

  return (
    <>
      <div className="w-full h-max flex gap-2 items-center py-2 px-2 border-b-[1px]">
        {
          fetchingDiscussion ? (
            <>
              <Skeleton className="bg-gray-500 rounded-full h-[50px] w-[50px] flex items-center justify-center relative overflow-hidden" />
              <div>
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4 bg-gray-500" />
                  <Skeleton className="w-24 h-2" />
                </div>
              </div>
              <div className="flex-grow"></div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="w-32 h-4 bg-gray-500" />
                <Skeleton className="w-24 h-2" />
              </div>
            </>
          ) : currentDiscussion && (
            <>
              <div className="bg-gray-500 rounded-full h-[50px] w-[50px] flex items-center justify-center text-white font-bold relative overflow-hidden">
                <Image
                  fill
                  src={currentDiscussion?.user?.image || defaultprofile}
                  alt="profile-picture"
                  className=""
                />
              </div>
              <div>
                <div>
                  <p className="text-sm font-bold">{currentDiscussion.user?.firstname ? (currentDiscussion?.user.firstname + " " + currentDiscussion?.user.lastname) : `Guest #${currentDiscussion?.discussionid.slice(-8)}`}</p>
                  <h1 className="text-xs">{currentDiscussion.user?.email}</h1>
                </div>
              </div>
              <div className="flex-grow"></div>
              <div className="text-right">
                <p>{currentDiscussion?.type} discussion</p>
                <p className={clsx("text-xs", {
                  "text-yellow-500": currentDiscussion.status == "Pending",
                  "text-blue-500": currentDiscussion.status == "On-process",
                })}>{currentDiscussion.status}</p>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {
                    currentDiscussion.booking && (
                      <DropdownMenuItem onClick={() => handleSetOperation("view")}>View booking</DropdownMenuItem>
                    )
                  }
                  <DropdownMenuItem className="text-red-500" onClick={() => handleSetOperation("close")}>Close discussion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
                <DialogContent className={clsx("", { "min-w-[80vw] min-h-[80vh] max-h-[80vh] flex flex-col": operation == "view" })}
                  disableclose={zoom}>
                  {
                    operation == "view" ? (
                      <FullBookingDetails
                        data={currentDiscussion.booking as unknown as BookingDataTable}
                      />
                    ) : operation == "close" && (
                      <CoolDownDialog
                        open={openModal}
                        close={() => setOpenModal(false)}
                        title="Closing Discussion"
                        description="Closing this discussion will be marked it as closed and the client won't be able to interact through the discussion. Please make sure that the issue/conflict is resolved before closing the discussion."
                        accept={() => closeDiscussion()}
                        isContent
                      />
                    )
                  }
                </DialogContent>
              </Dialog>
            </>
          )
        }
      </div>
      <div className="flex-grow flex flex-col relative overflow-hidden">
        <div className={clsx("flex-grow p-4", {
          "overflow-y-auto scroll": ready
        })}>
          {
            fetchingMessages || !ready ? (
              <div className="w-full h-full flex flex-col">
                <div className="chat chat-start">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
                <div className="chat chat-end">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
                <div className="chat chat-end">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
                <div className="chat chat-start">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
                <div className="chat chat-end">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
                <div className="chat chat-start">
                  <div className="chat-bubble before:w-0 p-0 rounded-lg h-12 w-[50%] text-sm min-h-[0px] bg-none">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
              </div>
            ) : (
              <>

                {
                  hasMore && (
                    <div className="w-full flex flex-col items-center mt-5">
                      <p className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => setPage((prev) => prev + 1)}>Load more</p>
                    </div>
                  )
                }

                {messages.sort((a, b) => a.date - b.date).map((item, i) => (
                  <>
                    {
                      item.type == "message" ? (
                        <div key={`message-${i}`} className={item.sender === "Client" ? "chat chat-start" : "chat chat-end"}>
                          <div className={clsx("chat-bubble before:w-0 rounded-lg max-w-[50%] text-sm min-h-[0px]", {
                            "text-black bg-white border": item.sender === "Client",
                            "text-white": item.sender == "Admin"
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
                        <a target="_blank" href={item.content} key={`attachment-${i}`}>
                          <div className={item.sender === "Client" ? "chat chat-start" : "chat chat-end"}>
                            <div className={clsx("chat-bubble before:w-0 rounded-lg max-w-[70%] text-sm min-h-[0px]", {
                              "text-black bg-white border": item.sender === "Client",
                              "text-white": item.sender == "Admin"
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
                        <p className={clsx("text-center text-xs px-4 py-2", { "hidden": item.sender == "Client" })} key={`system-${i}`}>{item.content}</p>
                      )
                    }
                  </>
                ))}
              </>
            )
          }
        </div>
        {
          currentDiscussion && (
            <AttachmentExtension
              open={openAttachment}
              close={() => setOpenAttachment(false)}
              currentDiscussion={currentDiscussion}
              setMessages={setMessages}
              sender={"Admin"}
              className="bg-black"
            />
          )
        }
      </div>
      <div className="flex items-center gap-2 px-4 py-2 relative">
        {
          currentDiscussion && currentDiscussion.status == "On-process" && currentDiscussion.type.toLowerCase() == "refund" && !currentDiscussion?.booking?.refund?.refunded && (
            <div className="absolute left-1/2 -translate-x-2/4 -top-10 flex gap-2">
              <div className="px-4 py-2 text-sm border rounded-full cursor-pointer bg-white hover:bg-black hover:text-white transition-all" onClick={() => markAsRefunded(false)}>
                Mark as refunded
              </div>
            </div>
          )
        }
        <Button variant={"ghost"} className="w-max"
          onClick={() => setOpenAttachment(true)}
          disabled={fetchingMessages || fetchingDiscussion}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)} placeholder="Chat here..."
          onKeyDown={(e) => {
            if (e.code == 'Enter') {
              e.preventDefault()
              send()
            } else {
              return e
            }
          }}
          disabled={fetchingMessages || fetchingDiscussion}
        />
        <SendHorizontal className="w-6 h-6 cursor-pointer" onClick={() => send()} />
      </div>

      <FullCoverLoading open={processing} defaultOpen={false} loadingLabel="Processing, please wait..." />
    </>
  );
}
