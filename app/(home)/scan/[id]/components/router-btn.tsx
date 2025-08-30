'use client'

import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { useRouter } from "next/navigation"

export default function RouterBtn({ link, label, className }: { link: string, label: string, className?: string }) {
  const router = useRouter()

  return (
    <Button className={cn("", className)} onClick={() => router.push(link)}>{label}</Button>
  )
}