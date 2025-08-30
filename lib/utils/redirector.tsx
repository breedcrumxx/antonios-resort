'use client'

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Redirector({ children }: { children: React.ReactNode }) {

  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()

  useEffect(() => {
    if (status == "unauthenticated") {
      router.push(`/signin?callbackUrl=${pathname}`)
    }
  }, [status])

  return (
    <>
      {children}
    </>
  )
}