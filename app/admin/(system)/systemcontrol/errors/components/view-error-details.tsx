'use client'

import { DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Separator } from "@/app/components/ui/separator"
import { Textarea } from "@/app/components/ui/textarea"
import { defaultprofile } from "@/lib/configs/config-file"
import { systemerrorlog } from "@/lib/zod/z-schema"
import Image from 'next/image'
import { z } from "zod"

export default function ViewErrorDetails({ data }: { data: z.infer<typeof systemerrorlog> }) {

  const headers = JSON.parse(data.requestheaders)
  console.log(data.user)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{data.code}</DialogTitle>
        <DialogDescription>{data.requesturl}</DialogDescription>
      </DialogHeader>
      <div className="w-full h-full px-10 space-y-4 overflow-x-hidden">
        <h1 className="font-semibold text-gray-500">Affected user</h1>
        <div className="flex gap-4">
          <div className="w-[100px] h-[100px] rounded-[150px] bg-gray-500 relative overflow-hidden">
            <Image
              fill
              src={data?.user?.image || defaultprofile}
              alt="user-profile"
            />
          </div>
          <div>
            {
              data.user ? (
                <>
                  <p className="text-xs font-semibold text-gray-500">User information</p>
                  <p className="font-semibold">{data.user.email}</p>
                  <p className="text-sm">{data.user.firstname + " " + data.user.lastname}</p>
                  <p className="text-xs opacity-70">{data.user.role.role}</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-gray-500">User information</p>
                  <p className="font-semibold">Unknown</p>
                  <p className="text-xs text-gray-500">User is not authenticated.</p>
                </>
              )
            }
          </div>
          <div className="flex-grow"></div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Request information</p>
            <p className="font-semibold text-right">{data.requestmethod}</p>
            <p className="text-sm opacity-70 text-right">{data.userip}</p>
            <p className="text-sm opacity-70 text-right">{headers["sec-ch-ua-platform"]}</p>
          </div>
        </div>

        <Separator />
        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Error message</h1>
          <div>
            <Textarea className="min-h-[150px] resize-none text-red-500" readOnly>{data.message}</Textarea>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Error stacktrace</h1>
          <div>
            <Textarea className="min-h-[300px] resize-none text-red-500" readOnly>{data.stacktrace}</Textarea>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Request headers</h1>
          <div>
            <Textarea className="min-h-[300px] resize-none bg-black text-white" readOnly>{JSON.stringify(headers, null, 4)}</Textarea>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Request content</h1>
          <div>
            {
              data.requestmethod == "GET" ? (
                <p>This request has no content.</p>
              ) : (
                <Textarea className="min-h-[200px] resize-none bg-black text-white" readOnly>{JSON.stringify(JSON.parse(data.requestbody), null, 4)}</Textarea>
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}