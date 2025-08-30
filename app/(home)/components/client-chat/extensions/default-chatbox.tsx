'use client'

import { Button } from "@/app/components/ui/button";
import useScroll from "@/lib/utils/scroll-hook";
import clsx from "clsx";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { useChat } from "../provider";
import { StartBlockedExtension, StartNewDiscussionExtension, StartOpenDiscussionExtension, StartReservationIssueExtension } from "./chat-extensions";
import { useDialogs } from "./dialog-provider";
import { logo } from "@/lib/configs/config-file";

const defaultIssues = [
  // { dialog: "I can't log in to my account.", actionable: false, steps: accountIssueDialog, extension: () => { } },
  { dialog: "My account got blocked.", actionable: true, extension: StartBlockedExtension, position: "inner" },
  // { dialog: "I encountered an error on the website.", actionable: true, steps: "", extension: () => { } },
  { dialog: "I need help regarding with my reservation.", actionable: true, extension: StartReservationIssueExtension, position: "inner" },
  { dialog: "Open discussion", actionable: false, extension: StartOpenDiscussionExtension, position: "outer" },
];

export default function DefaultChatBox({ user }: { user: UserSession | null }) {

  const { operation } = useChat()
  const { dialogs } = useDialogs()

  const container = useScroll([dialogs])

  // states
  const [showPrompts, setShowPrompts] = useState<boolean>(true)
  const [position, setPosition] = useState<string>("")

  // values
  const [Component, setComponent] = useState<JSX.Element>(<></>)

  useEffect(() => {
    if (operation == "new") {
      setShowPrompts(false)
      setPosition("inner")
      setComponent(<StartNewDiscussionExtension cancelPrompt={cancelPrompt} />)
    }
  }, [operation])

  const cancelPrompt = () => {
    setShowPrompts(true)
    setComponent(<></>)
  }

  const defaultDialogs = (i: number) => {
    setShowPrompts(false)
    const XtensionComponent = defaultIssues[i].extension
    setPosition(defaultIssues[i].position)
    setComponent(<XtensionComponent cancelPrompt={cancelPrompt} />)
  }

  return (
    <>
      <div className="w-full h-[60vh] py-2 bg-white">
        <div ref={container} className="w-full h-full flex flex-col px-2 overflow-y-scroll scroll relative">
          <div className="w-full flex flex-col items-center mt-5">
            <div className="w-[50px] h-[50px] rounded-full border overflow-hidden">
              <img
                className="aspect-auto object-cover object-center"
                src={logo} alt="Antonio's Resort Logo" />
            </div>
            <p className="font-semibold text-sm">AR Assistant</p>
            <p className="text-center text-xs">Hello! I&apos;m your chat assistant. How can I assist you today?</p>
          </div>

          <div>
            {dialogs.map((item, i: number) => (
              <>
                {
                  item.type == "message" ? (
                    <div key={i} className={item.sender === "Admin" ? "chat chat-start" : "chat chat-end"}>
                      <div className={clsx("chat-bubble before:w-0 rounded-lg max-w-[70%] text-sm min-h-[0px]", {
                        "text-black bg-white border": item.sender === "Admin",
                        "text-white": item.sender == "Client"
                      })} dangerouslySetInnerHTML={{ __html: item.content }}>
                      </div>
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
                  ) : item.type == "attachment" ? (
                    <a target="_blank" href={item.content}>
                      <div key={i} className={item.sender === "Admin" ? "chat chat-start" : "chat chat-end"}>
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
                      key={i}
                      className={clsx("text-center text-xs px-4 py-2", { "hidden": item.sender == "Admin" })}
                    >{item.content}</p>
                  )
                }
              </>
            ))}
          </div>

          {
            showPrompts && (
              <div className="flex flex-col items-center pt-2 space-y-2">
                {
                  defaultIssues.map((item, i) => (
                    <Button variant={"outline"} className="rounded-[50px] text-xs w-max px-2 py-1" key={i} onClick={() => defaultDialogs(i)}>{item.dialog}</Button>
                  ))
                }
              </div>
            )
          }

          {position == "inner" && (
            <>
              {Component}
            </>
          )}

        </div>
      </div>
      {position == "outer" && (
        <>
          {Component}
        </>
      )}
    </>
  )
}