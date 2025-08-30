'use client'

import { Button } from "@/app/components/ui/button"
import { useRouter } from "next/navigation"

export default function ScanAgain() {

  const router = useRouter()

  const scanAgain = () => {
    router.push("/scan")
  }

  return (
    <Button variant={"outline"} className="w-full" onClick={() => scanAgain()}>Scan another booking</Button>
  )
}