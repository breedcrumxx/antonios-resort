import React, { useEffect, useState } from "react"
import { getCancellationPolicy } from "./get-cancellation-policy"
import { defaultCancellationPolicy } from "@/lib/configs/config-file"
import { Spinner } from "@nextui-org/spinner"


export default function CancellationPolicyContent({ children }: { children: React.ReactNode }) {

  // value
  const [content, setContent] = useState<string>("")


  useEffect(() => {
    const fetchData = async () => {
      const response = await getCancellationPolicy()

      if (response.status == 500) {
        setContent(defaultCancellationPolicy)
      } else {
        setContent(response.data as string)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      {
        content.length > 0 ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: content }}></div>
            {children}
          </>
        ) : (
          <div className="absolute left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 flex justify-center items-center">
            <Spinner label="Getting cancellation policy..." />
          </div>
        )
      }

    </>
  )
}