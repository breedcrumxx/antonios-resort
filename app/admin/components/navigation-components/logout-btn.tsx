'use client'

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function LogoutBtn() {
  return (
    <LogOut className="w-4 h-4 cursor-pointer" onClick={() => signOut()} />
  )
}