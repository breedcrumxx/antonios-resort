'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { getAcceptedDates } from "@/lib/actions/account-actions/account-policy-update"
import { format } from "date-fns"
import { useEffect, useState } from "react"

export default function AcceptedAgreements({ userid }: { userid: string }) {

  // states 
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  // values
  const [data, setData] = useState<{
    lastacceptedprivacy: Date;
    lastacceptedagreement: Date | null;
    lastacceptedtermscondition: Date;
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAcceptedDates(userid)
      setLoading(false)

      if (response.status == 500) {
        setError(true)
        return
      }
      if (response.status == 404) {
        setError(true)
        return
      }
      if (response.status == 200) {
        setData(response.data)
      }

    }

    fetchData()
  }, [])

  return (
    <>
      {
        loading ? (
          <>
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[200px]" />
          </>
        ) : error ? (
          <div className="text-red-500 text-sm">
            We were unable to retrieve the date of your agreement to the Privacy Policy, Cookie Policy, or Terms & Conditions.
          </div>
        ) : (
          <>
            {
              data?.lastacceptedprivacy ? <p className="text-sm font-bold">Last accepted privacy & cookie policy: <span className="font-normal">{format(data?.lastacceptedprivacy, "PPP")}</span></p> : <p className="text-sm"><span className="font-bold">Privacy & cookie policy</span> has not yet accepted.</p>
            }
            {
              data?.lastacceptedagreement ? <p className="text-sm font-bold">Last accepted reservation agreement: <span className="font-normal">{format(data?.lastacceptedagreement, "PPP")}</span></p> : <p className="text-sm"><span className="font-bold">Reservation agreement</span> has not yet accepted.</p>
            }
            {
              data?.lastacceptedtermscondition ? <p className="text-sm font-bold">Last accepted terms & conditions: <span className="font-normal">{format(data?.lastacceptedtermscondition, "PPP")}</span></p> : <p className="text-sm"><span className="font-bold">Terms & conditions</span> has not yet accepted.</p>
            }
          </>
        )
      }
      <br />
    </>
  )
}