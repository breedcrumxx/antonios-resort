'use client'
import { discussion } from '@/lib/zod/z-schema'
import { format } from 'date-fns'
import z from 'zod'
import { Card } from '@/app/components/ui/card'
import { useChat } from '@/app/(home)/components/client-chat/provider'

export default function RenderDiscussionCards({ data }: { data: z.infer<typeof discussion>[] }) {

  const { open, setOpen, setOperation, setDiscussionid } = useChat()

  const openDiscussion = (item: z.infer<typeof discussion>) => {
    if (open == false) {
      setOpen(true)
    }
    setDiscussionid(item.discussionid)
    setOperation("discussion")
  }

  return (
    <>
      {
        data.map((item, i) => (
          <Card
            className="cols-span-1 p-4 cursor-pointer relative hover:bg-muted"
            onClick={() => openDiscussion(item)}
            key={i}
          >
            <p className="font-semibold text-sm">{item.type}</p>
            <p className="text-sm text-gray-500 text-xs">{item.chats[0].content}</p>
            <p className="text-right text-xs">{format(item.date, "PPP")}</p>
          </Card>
        ))
      }
    </>
  )
}