'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Separator } from "@/app/components/ui/separator"
import { Textarea } from "@/app/components/ui/textarea"
import { defaultprofile } from "@/lib/configs/config-file"
import { problemreport } from "@/lib/zod/z-schema"
import clsx from "clsx"
import { Paperclip } from "lucide-react"
import Image from 'next/image'
import { useState } from "react"
import { z } from "zod"

export default function ViewReportDetails({ data }: { data: z.infer<typeof problemreport> }) {

  // states
  const [viewAttachment, setViewAttachment] = useState<boolean>(false)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{data.code}</DialogTitle>
        <DialogDescription>{data.severity}</DialogDescription>
      </DialogHeader>
      <div className="flex-grow px-10 space-y-4 overflow-x-hidden overflow-y-scroll scroll">
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
            <p className="text-xs font-semibold text-right text-gray-500">Report status</p>
            <p className="font-semibold text-right">{data.severity}</p>
            <p className="text-sm opacity-70 text-right">{data.issueId ? "Included in case" : "No case"}</p>
            <p className={clsx("text-sm opacity-70 text-right", {
              "text-green-500": data.status == "Solved"
            })}>{data.status}</p>
          </div>
        </div>

        <Separator />
        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Report</h1>
          <div>
            <Textarea className="min-h-[100px] resize-none" readOnly>{data.report}</Textarea>
          </div>
          <div className="w-full rounded-lg flex items-center gap-2 border p-4 hover:underline cursor-pointer" onClick={() => {
            if (data.image) setViewAttachment(true)
          }}>
            <Paperclip className="h-4 w-4" />
            Attachment
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Error message</h1>
          <div>
            <Textarea className="min-h-[150px] resize-none text-red-500" readOnly>{data.errormessage}</Textarea>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Error stacktrace</h1>
          <div>
            <Textarea className="min-h-[300px] resize-none text-red-500" readOnly>{data.stacktrace}</Textarea>
          </div>
        </div>

        {/* <div className="space-y-2">
          <h1 className="font-semibold text-gray-500">Request headers</h1>
          <div>
            <Textarea className="min-h-[300px] resize-none bg-black text-white" readOnly>{JSON.stringify(headers, null, 4)}</Textarea>
          </div>
        </div> */}

        {/* <div className="space-y-2">
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
        </div> */}
      </div>
      <Dialog open={viewAttachment} onOpenChange={(e) => setViewAttachment(e)}>
        <DialogContent className="min-w-[100vw] h-[100vh] flex justify-center bg-transparent overflow-y-scroll scroll" customclose="text-white">
          <br />
          <img src={data.image as string} alt="" />
        </DialogContent>
      </Dialog>
    </>
  )
}