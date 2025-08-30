'use client'

import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { MessageCircle, MessageCircleMore } from "lucide-react";
import ChatHeader from "./chat-header";
import DefaultChatBox from "./extensions/default-chatbox";
import DialogProvider from "./extensions/dialog-provider";
import DiscussionExtension from "./extensions/discussion-extension";
import { useChat } from "./provider";
import { FloatButton } from "antd"

export default function ChatFloater({ user }: { user: UserSession | null }) {

  const { open, setOpen, operation } = useChat()

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div>
          <FloatButton
            className="hover:bg-white/70"
            style={{ marginBottom: 10 }}
            icon={<MessageCircleMore className="w-full" />}
            onClick={() => setOpen(!open)} />
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-screen sm:h-auto sm:w-[400px]">
        <DialogProvider>
          <ChatHeader />
          {
            operation == "default" || operation == "new" ? (
              <DefaultChatBox user={user} />
            ) : (
              <DiscussionExtension user={user} />
            )
          }
        </DialogProvider>
      </PopoverContent>
    </Popover>
  )
}