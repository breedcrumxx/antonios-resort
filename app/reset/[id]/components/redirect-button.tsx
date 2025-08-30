'use client'

import { Button } from "@/app/components/ui/button"
import { useRouter } from "next/navigation"

export default function RedirectButton({ children, href }: { children: React.ReactNode, href: string }) {

  const router = useRouter()

  return (
    <Button className="bg-prm" onClick={() => router.push(href)}>{children}</Button>
  )
}