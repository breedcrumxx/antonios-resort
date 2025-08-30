'use client'

import { useDevs } from "@/app/providers/dev-configuration-provider"
import { balancerecord } from "@/lib/zod/z-schema"
import { message, Result } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { z } from "zod"
import { Spinner } from "@nextui-org/spinner"

export default function BookingBalanceTable({ bookingid }: { bookingid: string }) {

  const { dev } = useDevs()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values
  const [data, setData] = useState<z.infer<typeof balancerecord>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/bookings/${bookingid}/balances`)

        setData(response.data)
      } catch (error) {
        if (dev.DEBUG) {
          console.log(error)
        }
        message.error("Unable to get the balances!")
        setError(true)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <>
      {
        loading ? (
          <div className="min-h-[50vh] w-full flex justify-center items-center" >
            <Spinner label="Getting balance record..." />
          </div>
        ) : error ? (
          <div className="min-h-[50vh] w-full flex justify-center items-center" >
            <Result
              status="error"
              title="An error occured!"
              subTitle="Unable to get the balance record of this booking!"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:block">Summary</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{i + 1}.</TableCell>
                  <TableCell className="whitespace-nowrap">{item.type}</TableCell>
                  <TableCell className="hidden sm:block">{item.record}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">&#8369; {item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="hidden sm:block"></TableCell>
                <TableCell className="text-right">&#8369; {data.reduce((a, b) => a + b.total, 0).toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )
      }
    </>
  )
}