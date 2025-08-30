'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { getUserInfo } from "@/lib/actions/account-actions/get-user-info"
import { defaultprofile } from "@/lib/configs/config-file"
import { userinfosummary } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import clsx from "clsx"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import z from 'zod'
import AcceptedAgreements from "../../(admin)/settings/(user profile)/components/accepted-agreements"


// TODO: we can add more here like total spent, coupons, favorite package etc.
export default function ClientProfileAndActivity({ clientid }: { clientid: string }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [userinfo, setUserinfo] = useState<z.infer<typeof userinfosummary> | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserInfo(clientid)

      if (response.status == 500) {
        message.error("An error occured while processing your request, please try again later!")
        return
      }

      // console.log(response.data)
      setUserinfo(response.data as unknown as z.infer<typeof userinfosummary>)
      setLoading(false)

    }

    fetchData()
  }, [])

  return (
    <div className={clsx("w-full h-[100%] px-4 overflow-y-auto scroll", {
      "flex-grow flex items-center justify-center": loading
    })}>
      {
        loading ? (
          <Spinner label="Loading, please wait" />
        ) : userinfo ? (
          <>
            <div className="flex items-center gap-5 px-5">
              <div className="bg-gray-500 rounded-full h-[80px] w-[80px] flex items-center justify-center text-white text-2xl font-bold">
                <img src={userinfo.image || defaultprofile} className="w-full h-full aspect-auto" alt="" />
              </div>
              <div>
                <h1 className="font-semibold  text-xl">{userinfo.firstname + " " + userinfo.lastname}</h1>
                <h1 className="text-md">{userinfo.email}</h1>
              </div>
              <div className="flex-grow flex items-center">
                <div className="px-12 space-y-2">
                  <AcceptedAgreements userid={clientid} />
                </div>
              </div>
            </div>
            <div className="w-full stats bg-white text-foreground">
              <div className="stat place-items-center">
                <div className="stat-value">{userinfo._count.booking}</div>
                <div className="stat-title text-sm">Booking/s made</div>
                <div className="stat-desc"></div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-value text-blue-500">{userinfo.totalcompleted}</div>
                <div className="stat-title text-sm">Booking/s completed</div>
                <div className="stat-desc text-secondary"></div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-value text-prm">{userinfo._count.mycoupons}</div>
                <div className="stat-title text-sm">Coupons</div>
                <div className="stat-desc text-secondary"></div>
              </div>

            </div>



            <br />
            <h1 className="font-semibold">Recent bookings</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>Package name</TableHead>
                  <TableHead>Booked date</TableHead>
                  <TableHead className="text-center">Reservation date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userinfo.completedbookings.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i + 1}.</TableCell>
                    <TableCell className="whitespace-nowrap">{item.package.packagename}</TableCell>
                    <TableCell>{format(item.book_at, "PPP hh:mm a")}</TableCell>
                    <TableCell className="text-center">{format(item.checkin, "PPP hh:mm a")}</TableCell>
                    <TableCell className="text-blue-500">{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : null
      }
    </div>
  )
}