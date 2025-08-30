'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Minus, MoreHorizontalIcon, Undo2 } from "lucide-react"
import { useChat } from "./provider"

export default function ChatHeader() {

  const { setOpen, operation, setOperation, dataDiscussion } = useChat()

  return (
    <div className="w-full flex justify-between py-2 px-4 bg-muted">
      {
        operation == "discussion" && (
          <div className="flex gap-2 items-center">
            <Undo2 className="w-4 h-4 cursor-pointer" onClick={() => setOperation("default")} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreHorizontalIcon className="w-4 h-4 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Close discussion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
      <p className="text-sm font-semibold">{
        dataDiscussion ? dataDiscussion.discussionid : "AR Assistant"
      }</p>
      <div className="h-full flex items-center gap-2">
        <Minus className="w-4 h-4 cursor-pointer" onClick={() => setOpen(false)} />
      </div>
    </div>
  )
}