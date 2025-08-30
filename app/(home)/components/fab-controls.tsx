'use client'

import { FloatButton } from "antd"
import { HardHat } from "lucide-react"
import { useRouter } from "next/navigation"
import ChatFloater from "./client-chat/chat-floater"

export default function FabControls({ user }: { user: UserSession | null }) {

  const router = useRouter()
  router.prefetch('/admin')

  return (
    <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24, insetBlockEnd: 24 }}>
      <ChatFloater user={user} />
      {
        user && (user.role.businesscontrol || user.role.systemcontrol) && (
          <FloatButton className="hover:bg-white/70" icon={<HardHat className="w-full" />} onClick={() => router.push(user.role.businesscontrol ? "/admin" : "/admin/systemcontrol")} />
        )
      }
    </FloatButton.Group>
  )
}