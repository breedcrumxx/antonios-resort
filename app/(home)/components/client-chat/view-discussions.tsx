'use client'

import { discussion } from "@/lib/zod/z-schema"
import { message } from "antd"
import { useEffect, useState } from "react"
import z from 'zod'
import { Card } from '@/app/components/ui/card'
import { format } from "date-fns"

export default function ViewDiscussions({ user }: { user: UserSession }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values 
  const [discussions, setDiscussions] = useState<z.infer<typeof discussion>[]>([])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/discussion/user/${user.id}`, { method: 'GET' })

        if (!response.ok) {
          throw new Error()
          return
        }

        console.log(response.status)

        setDiscussions(await response.json())

      } catch (error) {
        message.error("An error occured, try again later!")
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <>
      {
        discussions.map((item, i) => (
          <Card className="p-4 cursor-pointer relative hover:bg-muted" key={i}>
            <p className="font-semibold text-sm">{item.type} discussion</p>
            <p className="text-sm text-gray-500 text-xs">I would like to request for a refund.</p>
            <p className="text-right text-xs">{format(item.date, "PPP")}</p>
          </Card>
        ))
      }
    </>
  )
}