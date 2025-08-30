'use client'

import RefundBookingForm from "@/app/(home)/profile/components/refund-booking-form"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Separator } from "@/app/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { bookingrecord, user } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { message, QRCode } from 'antd'
import axios, { AxiosError } from "axios"
import clsx from "clsx"
import { format } from "date-fns"
import { Copy, CornerUpLeft } from "lucide-react"
import { useEffect, useState } from "react"
import z from 'zod'
import BookingBalanceTable from "./booking-balance-table"
import CancellationRejectionReasonPanel from "./cancellation-rejection-reason-panel"
import ClientProfileAndActivity from "./client-profile"

import { getBookingSubTotal, getPrimePackagePrice } from "@/lib/utils/booking-price-utils"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import dynamic from 'next/dynamic'
import ExtendFormContent from "./extend-content"
import UpgradePackage from "./upgrade-package"
const LegalDocuments = dynamic(() => import('./legal-documents'), {
  ssr: false
})

import DownloadReceipt from "@/app/checkout/checkout-components/summary-components/download-receipt"
import { useZoom } from "../../(admin)/(dashboard)/bookings/booking-components/zoomer-provider"

export default function FullBookingDetails({
  data,
  isMyBooking,
  isContent,
  isOnScan,
  close,
  setClose,
  currentActiveView,
}: {
  data: BookingDataTable | z.infer<typeof bookingrecord>,
  isMyBooking?: boolean,
  isContent?: boolean,
  isOnScan?: boolean,
  close?: boolean,
  setClose?: () => void
  currentActiveView?: (value: string) => void,
}) {

  const { setZoom, setImage } = useZoom()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<string>("default")
  const [panelOperation, setPanelOperation] = useState<string>("")
  const [viewDocs, setViewDocs] = useState<boolean>(false)
  const [openExtend, setOpenExtend] = useState<boolean>(false)

  // values
  const [booking, setBooking] = useState<z.infer<typeof bookingrecord> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchdata = async () => {
      try {
        const response = await axios.get('/api/bookings/' + data.id, { signal })
        setBooking({ ...response.data, package: JSON.parse(response.data.packagedata) })
      } catch (error) {
        if (error instanceof AxiosError && error.code == "ERR_CANCELED") return
        message.error("An error occured!")
        setError(true)
      }

      setLoading(false)
    }

    if (!isOnScan) {
      fetchdata()
    } else {
      setBooking(data as z.infer<typeof bookingrecord>)
      setLoading(false)
    }

    return () => (
      controller.abort()
    )
  }, [])

  useEffect(() => {
    currentActiveView?.(activeView)
  }, [activeView])

  useEffect(() => {
    if (close) {
      setActiveView("default")
      setClose?.()
    }
  }, [close])

  const handleCheckPackage = () => {
    if (!booking) return
    sessionStorage.setItem('package', booking.packagedata)
    window.open(window.location.origin + '/package/' + booking.package.id + '?view=true')
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = 'QRCode.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReschedule = () => {
    if (!booking) return
    window.open(window.location.origin + `/reschedule/${booking.id}`)
  }

  const handleUpgradePackage = () => {
    if (!booking) return
    setPanelOperation("upgrade")
  }


  return (
    <>
      {
        !isContent && (
          <>
            {
              activeView == "default" ? (
                <DialogHeader className="h-max">
                  <DialogTitle>Booking details</DialogTitle>
                </DialogHeader>
              ) : (
                <p className="cursor-pointer flex items-center gap-2" onClick={() => setActiveView("default")}> <CornerUpLeft className="w-4 h-4" /> back</p>
              )
            }
          </>
        )
      }
      {
        loading ? (
          <div className={clsx("flex-grow flex items-center justify-center", {
            "min-h-screen": isOnScan
          })}>
            <Spinner label="Loading, please wait..." />
          </div>
        ) : error ? (
          <div className={clsx("flex-grow flex items-center justify-center", {
            "min-h-screen": isOnScan
          })}>
            <div className="min-w-screen min-h-screen flex justify-center">
              <ErrorFeedback
                error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
                code="PAGE-ERR-0019"
                subtitle="An error occured while requesting this page, please try again later!"
              />
            </div>
          </div>
        ) : booking && activeView == "default" ? (
          <div className="w-full h-full px-4 overflow-y-auto scroll">
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600 font-semibold">Basic details</p>
              <p className="w-1/3"></p>
              {
                booking.legal && (
                  <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setViewDocs(true)}>Show document</p>
                )
              }
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Booking ID</p>
              <p className="w-1/3 text-sm font-semibold">{booking.bookingid}</p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setPanelOperation("code")}>Show QR code</p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Booked on</p>
              <p className="w-1/3 text-sm font-semibold">{format(booking.book_at, "PPP")}</p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setActiveView("logs")}>Check logs</p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Status</p>
              <p className={clsx("w-1/3 text-sm font-semibold", {
                "text-red-500": booking.status == "Rejected" || booking.status == "Cancelled",
                "text-blue-500": booking.status == "Completed",
                "text-green-500": booking.status == "Approved",
                'text-yellow-500': booking.status == "Pending"
              })}>{booking.status}</p>
              {
                ['Rejected', 'Cancelled'].includes(booking.status) ? (
                  <p className="w-1/3 text-sm text-right text-blue-500 cursor-pointer hover:underline" onClick={() => setPanelOperation("reason")}>View reason</p>
                ) : (
                  <p className="w-1/3 text-sm"></p>
                )
              }
            </div>
            {
              ['Rejected', 'Cancelled', 'Completed', 'No-show'].includes(booking.status) && booking.refund && (
                <>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Refunded</p>
                    <p className={clsx("w-1/3 text-sm font-semibold", {
                      "text-red-500": !booking.refund.isvalid,
                      "text-green-500": booking.refund.isvalid,
                    })}>{(booking.refund.refunded ? "Yes" : "No")}</p>
                    <p className="w-1/3 text-sm text-gray-600"></p>
                  </div>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Refundable</p>
                    <p className={clsx("w-1/3 text-sm font-semibold", {
                      "text-red-500": !booking.refund.isvalid,
                      "text-green-500": booking.refund.isvalid,
                    })}>{booking.refund.isvalid ? "Yes" : "No"} {new Date(booking.refund.refundableuntil).getTime() < new Date().getTime() ? "(Expired)" : ""}</p>
                    <p className="w-1/3 text-sm text-gray-600"></p>
                  </div>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Refundable until</p>
                    <p className="w-1/3 text-sm font-semibold">{format(booking.refund.refundableuntil, "PPP hh:mm a")}</p>
                    <p className="w-1/3 text-sm text-gray-600"></p>
                  </div>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Refundable amount</p>
                    <p className="w-1/3 text-sm font-semibold">&#8369; {booking.refund.refundables.toLocaleString()}</p>
                    {
                      isMyBooking && (
                        <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setPanelOperation("refund")}>Request refund</p>
                      )
                    }
                  </div>
                </>
              )
            }
            <Separator className="my-1" />
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600 font-semibold">Personal Information</p>
              <p className="w-1/3"></p>
              {
                isMyBooking || isOnScan ? (
                  <p className="w-1/3"></p>
                ) : (
                  <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setActiveView("client")}>Check user account</p>
                )
              }
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Guest</p>
              <p className="w-1/3 text-sm font-semibold">{booking.client.firstname + " " + booking.client.lastname}</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Contact email</p>
              <p className="w-1/3 text-sm font-semibold">{booking.client.email}</p>
              <p className="w-1/3 "></p>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm font-semibold text-gray-600">Schedule</p>
              <p className="w-1/3 font-semibold"></p>
              {
                (isMyBooking || isOnScan) && booking.status == "Approved" && (
                  <p className={"w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline"} onClick={() => handleReschedule()}>Reschedule</p>
                )
              }
            </div>
            {
              booking.package.type != "event" ? (
                <>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Check-in</p>
                    <p className="w-1/3 text-sm font-semibold">{format(booking.checkin, "MMMM do yyyy, h:mm a")}</p>
                    <p className="w-1/3 "></p>
                  </div>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Check-out</p>
                    <p className="w-1/3 text-sm font-semibold">{format(booking.checkout, "MMMM do yyyy, h:mm a")}</p>
                    {
                      booking.package.type == "villa" && booking.slot == "night" && booking.status == "Ongoing" && !isMyBooking && (
                        <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setOpenExtend(true)}>Extend this booking</p>
                      )
                    }
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Open</p>
                    <p className="w-1/3 text-sm font-semibold">{format(booking.checkin, "MMMM do yyyy, h:mm a")}</p>
                    <p className="w-1/3 "></p>
                  </div>
                  <div className="flex items-center py-1">
                    <p className="w-1/3 text-sm text-gray-600">Closing</p>
                    <p className="w-1/3 text-sm font-semibold">{format(booking.checkout, "MMMM do yyyy, h:mm a")}</p>
                    <p className="w-1/3 "></p>
                  </div>
                </>
              )
            }
            <Separator className="my-1" />
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm font-semibold text-gray-600">Package details</p>
              <p className="w-1/3 font-semibold"></p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => handleCheckPackage()}>Check package</p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Package name</p>
              <p className="w-1/3 text-sm font-semibold">{booking.package.packagename}</p>
              {
                !['Pending', 'Cancelled', 'Rejected', 'Completed', 'Ongoing', 'No-show'].includes(booking.status) ? (
                  <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => handleUpgradePackage()}>Upgrade package</p>
                ) : (
                  <p className="w-1/3 text-sm font-semibold"></p>
                )
              }
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Package price</p>
              <p className="w-1/3 text-sm font-semibold">&#8369; {booking.package.type == 'cottage' ? (
                <span>{booking.package.regular_stay.price.toLocaleString()}</span>
              ) : (
                <>{
                  booking.slot == "day" ? (
                    <>{booking.package.day_tour.price.toLocaleString()}</>
                  ) : (
                    <>{booking.package.night_tour.price.toLocaleString()}</>
                  )
                }</>
              )
              }</p>
              <p className="w-1/3 "></p>
            </div>
            {
              booking.package.type != "cottage" && (
                <div className="flex items-center py-1">
                  <p className="w-1/3 text-sm text-gray-600">Slot</p>
                  <p className="w-1/3 text-sm font-semibold capitalize">{booking.slot} {booking.package.type == "event" ? "event" : "tour"}</p>
                  <p className="w-1/3 "></p>
                </div>
              )
            }
            {
              booking.slot == "night" && booking.package.type == "villa" && (
                <div className="flex items-center py-1">
                  <p className="w-1/3 text-sm text-gray-600">Nights</p>
                  <p className="w-1/3 text-sm font-semibold">x {booking.days}</p>
                  <p className="w-1/3 "></p>
                </div>
              )
            }
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Sets</p>
              <p className="w-1/3 text-sm font-semibold">x {booking.quantity}</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Adult/s</p>
              <p className="w-1/3 text-sm font-semibold">{booking.adults}</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Senior/PWD</p>
              <p className="w-1/3 text-sm font-semibold">{booking.seniorpwds}</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Teens/kids</p>
              <p className="w-1/3 text-sm font-semibold">{booking.teenkids}</p>
              <p className="w-1/3 "></p>
            </div>
            {
              booking.slot == "regular" && (
                <div className="flex items-center py-1">
                  <p className="w-1/3 text-sm text-gray-600">Celebrants</p>
                  <p className="w-1/3 text-sm font-semibold">{booking.celebrant}</p>
                  <p className="w-1/3 "></p>
                </div>
              )
            }
            <Separator className="my-1" />
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm font-semibold text-gray-600">Payment</p>
              <p className="w-1/3 font-semibold"></p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setActiveView("payment")}>View payment</p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Payment option</p>
              <p className="w-1/3 text-sm font-semibold">Gcash</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Payment type</p>
              <p className="w-1/3 text-sm font-semibold">{booking.transaction.payment_type}</p>
              <p className="w-1/3 "></p>
            </div>
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Total booking price</p>
              <p className="w-1/3 text-sm font-semibold">&#8369; {booking.total.toLocaleString()}</p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setActiveView("receipt")}>View digital receipt</p>
            </div>
            {
              booking.package.discount > 0 && (
                <div className="flex items-center py-1">
                  <p className="w-1/3 text-sm text-gray-600">Package discount</p>
                  <p className="w-1/3 text-sm font-semibold">- {booking.package.discount}%</p>
                  <p className="w-1/3 "></p>
                </div>
              )
            }
            {
              booking.appliedcoupons.length > 0 && (
                <div className="flex py-1">
                  <p className="w-1/3 text-sm text-gray-600">Applied coupons</p>
                  <div>
                    {booking.appliedcoupons.map((item, i) => (
                      <p className="text-sm font-semibold" key={i}>{item.couponcode} - {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                    ))}
                  </div>
                  <p className="w-1/3 "></p>
                </div>
              )
            }
            <div className="flex items-center py-1">
              <p className="w-1/3 text-sm text-gray-600">Balance summary</p>
              <p className="w-1/3 text-sm font-semibold">&#8369; {
                booking.balance.reduce((a, b) => a + b.total, 0) > 0 ? (
                  booking.balance.reduce((a, b) => a + b.total, 0).toLocaleString()
                ) : (
                  "0"
                )
              }
              </p>
              <p className="w-1/3 text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setActiveView("balance")}>View details</p>
            </div>
          </div>
        ) : booking && activeView == "payment" ? (
          <div className="flex-grow sm:flex gap-4 px-4 overflow-y-auto">
            <div className="w-full sm:w-2/3 h-full">
              <h1 className="text-lg font-semibold">Transaction details</h1>
              {
                !booking.transaction.referenceimage ? (
                  <>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="text-sm font-semibold">None</p>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Payment reference number</p>
                      <p className="text-sm font-semibold">None</p>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Paid on</p>
                      <p className="text-sm font-semibold text-red-500">Payment not made</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="text-sm font-semibold">{booking.transaction.transactionid}</p>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Payment reference number</p>
                      <p className="text-sm font-semibold">{booking.transaction.reference}</p>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Payment type</p>
                      <p className="text-sm font-semibold">{booking.transaction.payment_type} {booking.transaction.payment_type == "Down payment" && <>({booking.downpaymentasofnow}%)</>}</p>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <p className="text-sm text-gray-600">Paid on</p>
                      <p className="text-sm font-semibold">{format(booking.transaction.date, "PPP")}</p>
                    </div>
                  </>
                )
              }
              <div className="grid grid-cols-2 py-1">
                <p className="text-sm text-gray-600">Expected amount of payment</p>
                <p className="text-sm font-semibold">&#8369; {
                  (booking.transaction.expectedpayment).toLocaleString()}</p>
              </div>

            </div>
            <br className="block sm:hidden" />
            <div className="flex-grow sm:w-1/3 sm:flex sm:justify-center bg-gray-300 relative overflow-hidden" onClick={() => setZoom(true)}>
              <img src={booking.transaction.referenceimage} className="h-full object-fit" alt="" />
            </div>

            {(() => setImage(booking.transaction.referenceimage))()}
          </div>
        ) : booking && activeView == "receipt" ? (
          <div className="w-full h-full px-4 overflow-y-auto scroll">
            <div className="flex justify-center">
              <Card id="receipt" className="w-[400px] space-y-2">
                <CardHeader>
                  <CardTitle className="text-center">
                    <span className="text-3xl">Antonio&apos;s Resort</span>
                    <br />
                    <span className="text-xl">Reservation receipt</span>
                  </CardTitle>
                  <CardDescription className="text-center">
                    <span className="gap-4">Booking #: {booking.bookingid}</span>
                    <br />
                    <span className="gap-4">Transaction #: {booking.transaction.transactionid}</span>
                    <DownloadReceipt />
                  </CardDescription>
                </CardHeader>
                <CardContent className="border-y py-4">
                  <div className="w-full">
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Guest name:</p>
                      <p>{booking.client.firstname + " " + booking.client.lastname}</p>
                    </div>
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Package:</p>
                      <p>{booking.package.packagename}</p>
                    </div>
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Book at:</p>
                      <p>{format(new Date(), "MM/dd/yy HH:mm")}</p>
                    </div>
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Check-in:</p>
                      <p>{format(booking.checkin, "MM/dd/yy HH:mm")}</p>
                    </div>
                    {
                      booking.package.type != "event" && (
                        <div className="w-full flex justify-between">
                          <p className="font-semibold">Check-out:</p>
                          <p>{format(booking.checkout, "MM/dd/yy HH:mm")}</p>
                        </div>
                      )
                    }
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Payment option:</p>
                      <p>GCash</p>
                    </div>
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Payment type:</p>
                      <p>{booking.transaction.payment_type}</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="w-full flex justify-between">
                      <p className="font-semibold"><span className="capitalize">{booking.slot}</span> tour:</p>
                      <p>&#8369; {getPrimePackagePrice(booking).toLocaleString()}</p>
                    </div>
                    {
                      booking.slot == "night" && (
                        <div className="w-full flex justify-between">
                          <p className="font-semibold">Night/s:</p>
                          <p>x {booking.days}</p>
                        </div>
                      )
                    }
                    <div className="w-full flex justify-between">
                      <p className="font-semibold">Sets:</p>
                      <p>x {booking.quantity}</p>
                    </div>
                    {
                      (booking.appliedcoupons.length > 0 || booking.package.discount > 0) && (
                        <div className="w-full">
                          <Separator className="my-2" />
                          <div className="w-full flex justify-between">
                            <p className="font-semibold">Sub-total:</p>
                            <p className="line-through">&#8369; {getBookingSubTotal(booking).toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    }

                    {
                      booking.appliedcoupons.map((item, i) => (
                        <div className="w-full flex justify-between pl-4 text-sm" key={i}>
                          <p className="font-semibold">{item.couponcode}</p>
                          <p className="text-sm" key={i}>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                        </div>
                      ))
                    }
                    {
                      booking.package.discount > 0 && (
                        <div className="w-full flex justify-between pl-4 text-sm">
                          <p className="font-semibold">Package discount</p>
                          <p className="text-sm">- {booking.package.discount}%</p>
                        </div>
                      )
                    }
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full space-y-1">
                    <div className="w-full flex justify-between">
                      <p className={clsx("font-semibold", {
                        "text-lg": booking.transaction.payment_type == "Full payment"
                      })}>Total amount:</p>
                      <p className="">&#8369; {
                        (
                          booking.total
                        ).toLocaleString()
                      } </p>
                    </div>
                    {
                      booking.transaction.payment_type == "Down payment" && (
                        <>
                          <div className="w-full flex justify-between">
                            <p className="font-semibold">Amount paid:</p>
                            <p>&#8369; {
                              (
                                booking.transaction.expectedpayment
                              ).toLocaleString()
                            }</p>
                          </div>
                          <div className="w-full flex justify-between text-lg font-semibold">
                            <p>To pay on-site:</p>
                            <p>&#8369; {
                              (
                                booking.total - booking.transaction.expectedpayment
                              ).toLocaleString()
                            }</p>
                          </div>
                        </>
                      )
                    }

                    <div className="w-full flex justify-between text-xs">
                      <p className="font-semibold">VAT Tax (already included):</p>
                      <p>&#8369; {(booking.total * .12).toLocaleString()}</p>
                    </div>
                    <br />
                    <p className="text-sm text-justify">Thank you for entrusting your plans with us. We will send you an email in a short time once your reservation has been approved.</p>
                    <p className="text-sm text-justify">If you have any questions or concerns, please contact the <span className="hover:underline text-blue-500 cursor-pointer">AR Support</span> or message us on our <a target="_blank" href="https://www.facebook.com/antonios.resort.ne" className="hover:underline text-blue-500 cursor-pointer">Facebook page</a></p>
                    <p></p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : booking && activeView == "balance" ? (
          <div className="w-full h-full px-4 overflow-y-auto scroll">
            <h1 className="font-semibold">Balance record for this booking</h1>
            <BookingBalanceTable bookingid={data.id} />
          </div>
        ) : booking && activeView == "client" ? (
          <ClientProfileAndActivity clientid={booking.client.id} />
        ) : booking && activeView == "logs" && (
          <div className="w-full h-full px-4 overflow-y-auto scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  booking.bookinglog.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{i + 1}.</TableCell>
                      <TableCell className="whitespace-nowrap">{item.status}</TableCell>
                      <TableCell>{format(item.log_at, "EEE MMMM, dd, yyyy 'at' h:mm a")}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        )
      }
      {
        booking && (
          <>
            <Dialog open={(panelOperation.length > 0)} onOpenChange={(e) => setPanelOperation("")}>
              <DialogContent id="access-pass" className={clsx("", { "min-h-[65vh] min-w-[65vw] max-h-[65vh] max-w-[65vw] flex flex-col overflow-hidden": panelOperation == "upgrade" })}>
                {
                  panelOperation == "code" ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div id="myqrcode" className="space-y-2">
                        <QRCode value={booking.bookingid || '-'}
                          color="#BC945E"
                        />
                      </div>
                      <div className="flex">
                        <p className="border rounded rounded-tr-none rounded-br-none py-2 px-4 text-sm">{booking.bookingid}</p>
                        <Button className="w-max px-4 rounded-tl-none rounded-bl-none">
                          <Copy className="h-4 w-4" onClick={() => {
                            navigator.clipboard.writeText(booking.bookingid)
                            message.success("Copied to clipboard!")
                          }} />
                        </Button>
                      </div>
                      <p>- or -</p>
                      <Button onClick={() => downloadQRCode()}>
                        Download
                      </Button>
                      <p className="text-sm opacity-70">Download a copy of QR for offline and scan on-site.</p>
                    </div>
                  ) : panelOperation == "reason" ? (
                    <CancellationRejectionReasonPanel bookingid={booking.id} status={booking.status} />
                  ) : panelOperation == "refund" && booking.refund ? (
                    <RefundBookingForm
                      bookingid={booking.bookingid}
                      data={{
                        id: booking.id,
                        refund: booking.refund,
                        user: booking.client as z.infer<typeof user>,
                        status: booking.status,
                      }}
                      close={() => setPanelOperation("")}
                    />
                  )
                    // : panelOperation == "session" ? (
                    //   <EndingSessionDialog
                    //     session={session}
                    //     packageid={booking.package.id}
                    //     close={() => setPanelOperation("")}
                    //   />
                    // ) : panelOperation == "noshow" ? (
                    //   <NoShowForm
                    //     booking={booking}
                    //     session={session as z.infer<typeof bookingsession>}
                    //     close={() => setPanelOperation("")}
                    //   />
                    // ) 
                    : panelOperation == "upgrade" && (
                      <UpgradePackage
                        booking={booking}
                      />
                    )
                }
              </DialogContent>
            </Dialog>
            <Dialog open={viewDocs} onOpenChange={(e) => setViewDocs(e)}>
              <DialogContent className="min-w-[100vw] min-h-[100vh] max-h-[100vh] px-32 overflow-y-auto scroll">
                {
                  viewDocs && (
                    <LegalDocuments
                      id={booking.id}
                      legal={booking.legal}
                    />
                  )
                }
              </DialogContent>
            </Dialog>
            <Dialog open={openExtend} onOpenChange={(e) => setOpenExtend(e)}>
              <DialogContent className="min-w-[50vw]" disableclose>
                <DialogHeader>
                  <DialogTitle>Extend Booking</DialogTitle>
                  <DialogDescription>Extend night tour and enjoy for a little longer?</DialogDescription>
                </DialogHeader>
                {
                  openExtend && (
                    <ExtendFormContent
                      bookingid={booking.id}
                      sets={booking.quantity}
                      checkin={booking.checkin}
                      days={booking.days}
                      prevtotal={booking.total}
                      bookingpackage={booking.package}
                      appliedcoupons={booking.appliedcoupons}
                      close={() => setOpenExtend(false)}
                    />
                  )
                }
              </DialogContent>
            </Dialog>
          </>
        )
      }

    </>
  )
}