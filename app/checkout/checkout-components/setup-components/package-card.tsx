'use client'

import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Separator } from "@/app/components/ui/separator"
import { Skeleton } from "@/app/components/ui/skeleton"
import { usePackageData } from "@/app/providers/package-data-provider"
import { FormError } from "@/lib/ui/form-banners"
import PolicyContainer from "@/lib/utils/policy-container"
import { message, Rate } from "antd"
import { useState } from "react"
import { useCheckout } from "../../provider"
import AgreementDialog from "../agreement-dialog"
import ApplyCoupons from "./apply-coupons"
import { bookingdata } from "@/lib/zod/z-schema"
import { z } from "zod"
import { placePrebook } from "@/lib/actions/booking-actions/process-booking"
import Link from "next/link"
import FullCoverLoading from "@/lib/utils/full-cover-loading"

export default function PackageCard({
  cancellationpolicy,
  user,
}: {
  cancellationpolicy: string,
  user: UserSession,
}) {

  const { packagedata, loading } = usePackageData()
  const {
    guestCount,
    setTab,
    calculation,
    slot,
    nights,
    currentSlot,
    dateStart,
    dateEnd,
    setToggleErrors,
    agreement,
    setAgreement,
    reservationConfig,
    sets,
    paymentType,
    activeCoupons,
    setActiveCoupons,
    setBookingid,
    setTransactionid,
    setId,
  } = useCheckout()

  // states
  const [prebooking, setPrebooking] = useState<boolean>(false)
  const [openAgreement, setOpenAgreement] = useState<boolean>(false)
  const [openPolicy, setOpenPolicy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [openPrivacy, setOpenPrivacy] = useState<boolean>(false)
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const [termsAccept, setAcceptTerms] = useState<boolean>(false)
  const [privacyAccept, setPrivacyAccept] = useState<boolean>(false)
  const [errorMode, setErrorMode] = useState<errorModeType>(null)


  const proceedToPayment = async () => {
    setErrorMessage("")

    // check for packagedata 
    if (!packagedata || !dateEnd || !calculation) {
      message.error(`Failed to place a booking, please try again later.`)
      return
    }

    if (!dateStart) {
      setToggleErrors((prev) => ({ ...prev, date: true }))
      setErrorMessage("Please select a date!")
      return
    }

    if ((guestCount.adults + guestCount.seniorpwds + guestCount.teenkids) == 0) {
      setErrorMessage("Unknown guest count!")
      setToggleErrors((prev) => ({ ...prev, count: true }))
      return
    }

    if (!agreement) {
      setOpenAgreement(true)
      return
    }

    const placebooking = bookingdata.omit({
      id: true,
      bookingid: true,
      refundid: true,
      refund: true,
      transacid: true,
      transaction: true,
      client: true,
      appliedcoupons: true,
      bookinglog: true,
    })

    // prepare all the data that needs to create a prebooking
    const booking: z.infer<typeof placebooking> = {
      book_at: new Date(),
      checkin: dateStart,
      checkout: dateEnd,
      slot: packagedata.type == "cottage" ? "regular" : slot,
      days: nights,
      packageid: packagedata.id,
      packagedata: JSON.stringify(packagedata),
      quantity: sets,

      adults: 1,
      seniorpwds: 1,
      teenkids: 1,
      celebrant: 1,

      total: calculation.total,
      legal: null,
      lastacceptedprivacy: new Date(),
      lastacceptedagreement: new Date(),
      lastacceptedtermscondition: new Date(),
      // totaldiscount: calculation.discount,
      downpaymentasofnow: reservationConfig.downpayment,
      status: "Waiting",

      balance: [],
      clientid: user.id,

      couponids: activeCoupons.map((item) => item.id)
    };

    // create a temp transaction
    const transaction = {
      reference: "",
      referenceimage: "",
      payment_type: paymentType,
      expectedpayment: (calculation.total * (calculation.downpaymentpercentage / 100)),
      type: "Booking",
      date: new Date(),
    }

    setPrebooking(true)
    const response = await placePrebook(transaction, booking)
    setPrebooking(false)

    if (response.status == 500) {
      message.error("Unable to prebook the date, please try again!")
      setErrorMode({
        title: "Internal server error!",
        description: "We encountered an error while prebooking your date, please try again later.",
        showHome: true,
        showClose: false,
        closable: true,
      })
      return
    }
    if (response.status == 400) {
      message.error("Unable to prebook the date, please try again!")
      setErrorMode({
        title: "An Error Occured!",
        description: "We encountered an error while prebooking your date, please try again. If the issue persist, please contact Customer support",
        showHome: true,
        showClose: false,
        closable: true,
      })
      return
    }
    if (response.status == 409) {
      message.error("Date occupied!")
      setErrorMode({
        title: "Date taken!",
        description: "Another client has made reservation to the date, please select a new one!",
        showHome: false,
        showClose: false,
        closable: true,
      })
      return
    }

    setTransactionid(response.data.transactionid)
    setBookingid(response.data.bookingid)
    setId(response.data.id)

    setTab("payment")
  }

  return (
    <div className="w-full min-h-[300px] flex flex-col space-y-2 bg-white">
      {
        loading ? (
          <div className="w-full flex-grow flex flex-col space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="flex-[1]" />
            <Skeleton className="h-4 w-1/2 self-end" />
          </div>
        ) : packagedata && (
          <>
            <div className="w-full p-4 space-y-2 border-b-[1px] border bg-gray-200/40">
              <div className="w-full">
                <div className="w-full h-[250px] grid grid-cols-3 grid-rows-3 gap-1">
                  <div className="flex items-center justify-center col-span-3 row-span-2 bg-gray-300 overflow-hidden relative">
                    <img
                      src={packagedata.images[0]}
                      alt="preview-image"
                      className="object-cover aspect-auto w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                    <img
                      src={packagedata.images[1]}
                      alt="preview-image"
                      className="object-cover aspect-auto w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                    <img
                      src={packagedata.images[2]}
                      alt="preview-image"
                      className="object-cover aspect-auto w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                    <img
                      src={packagedata.images[3]}
                      alt="preview-image"
                      className="object-cover aspect-auto w-full h-full"
                    />
                  </div>
                </div>
                <p className="font-semibold">{packagedata?.packagename}</p>
                <h1 className="font-semibold text-sm">{packagedata.avgratings ? packagedata.avgratings.toFixed(2) : 0} stars - {packagedata.ratingcount} reviews</h1>
                <Rate allowHalf value={packagedata.avgratings} disabled />
                <br />
              </div>
              <Separator />
              {
                packagedata.type != "cottage" ? (
                  <>
                    {
                      slot == "day" ? (
                        <div className="w-full flex justify-between text-sm">
                          <p className="font-semibold">Day tour price</p>
                          <p className="text-sm">&#8369; {packagedata.day_tour.price.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="w-full flex justify-between text-sm">
                          <p className="font-semibold">Night tour price</p>
                          <p className="text-sm">&#8369; {packagedata.night_tour.price.toLocaleString()}</p>
                        </div>
                      )
                    }
                  </>
                ) : (
                  <>
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Cottage price</p>
                      <p className="text-sm">&#8369; {packagedata.regular_stay.price.toLocaleString()}</p>
                    </div>
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Entrance fees</p>
                      <p className="text-sm"></p>
                    </div>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p className="font-semibold">Adult</p>
                      <p className="text-sm">&#8369; {reservationConfig.adults.toLocaleString()}</p>
                    </div>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p className="font-semibold">Senior/PWD</p>
                      <p className="text-sm">&#8369; {reservationConfig.seniorpwd.toLocaleString()}</p>
                    </div>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p className="font-semibold">Teen/kids</p>
                      <p className="text-sm">&#8369; {reservationConfig.teenkids.toLocaleString()}</p>
                    </div>
                  </>
                )
              }

              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Max pax</p>
                <p className="text-sm">{packagedata.maxpax}</p>
              </div>
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Available slot</p>
                <p className="text-sm">{currentSlot == 0 ? "Select a date first" : currentSlot}</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p>Booking summary</p>
              {
                packagedata.type == "villa" || packagedata.type == "event" ? (
                  <>
                    {
                      slot == "day" ? (
                        <div className="w-full flex justify-between text-sm">
                          <p className="font-semibold">Day tour price</p>
                          <p className="text-sm">&#8369; {packagedata.day_tour.price.toLocaleString()}</p>
                        </div>
                      ) : slot == "night" && (
                        <>
                          <div className="w-full flex justify-between text-sm">
                            <p className="font-semibold">Night tour price</p>
                            <p className="text-sm">&#8369; {packagedata.night_tour.price.toLocaleString()}</p>
                          </div>
                          {
                            packagedata.type == "villa" && (
                              <div className="w-full flex justify-between text-sm">
                                <p className="font-semibold">Night/s</p>
                                <p className="text-sm">x {nights}</p>
                              </div>
                            )
                          }
                        </>
                      )
                    }
                  </>
                ) : (
                  <div className="w-full flex justify-between text-sm">
                    <p className="font-semibold">Cottage price</p>
                    <p className="text-sm">&#8369; {packagedata.regular_stay.price.toLocaleString()}</p>
                  </div>
                )
              }
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Sets</p>
                <p className="text-sm">x {sets}</p>
              </div>
              <Separator />
              {
                (activeCoupons.length > 0 || packagedata.discount > 0) && (
                  <>
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Sub-total</p>
                      <p className="text-sm line-through">&#8369; {(calculation.subtotal).toLocaleString()}</p>
                    </div>
                    {
                      activeCoupons.map((item, i) => (
                        <div className="w-full flex justify-between text-xs pl-4" key={i}>
                          <p className="font-semibold">Coupon {item.couponcode}</p>
                          <p>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</p>
                        </div>
                      ))
                    }
                    {
                      packagedata.discount > 0 && (
                        <div className="w-full flex justify-between text-xs pl-4">
                          <p className="font-semibold">Applied discount</p>
                          <p>- {packagedata.discount} %</p>
                        </div>
                      )
                    }
                    {
                      Object.values(guestCount).reduce((a, b) => a + b, 0) >= 20 && packagedata.type != "cottage" && (
                        <div className="w-full flex justify-between text-xs pl-4">
                          <p className="font-semibold">Over 20 pax</p>
                          <p>- {reservationConfig.discountoverpax} %</p>
                        </div>
                      )
                    }
                    <Separator />
                  </>
                )
              }

              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Total</p>
                <p className="text-sm">&#8369; {calculation.total.toLocaleString()}</p>
              </div>
              <div className="w-full flex justify-between text-md">
                <p className="font-semibold">{paymentType == "Down payment" ? "Down payment" : "Amount to pay"}</p>
                <p>&#8369; {(calculation.total * (calculation.downpaymentpercentage / 100)).toLocaleString()}</p>
              </div>

              <p className="text-xs text-justify">Before proceeding to payment, please be sure to read the <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setOpenPolicy(true)}>cancellation and refund policy</span>, as well as the <a className="text-blue-500 cursor-pointer hover:underline" href="#notes">important notes</a>.</p>

              {
                packagedata && (Object.values(guestCount).reduce((a, b) => a + b, 0) > (packagedata.maxpax * sets)) && (
                  <>
                    <p className="text-xs text-justify text-red-500">Guest count exceeded the max pax of this package, consider upgrading to a package that supports more guest. <span className="text-blue-500 hover:underline cursor-pointer">Back to offers page.</span></p>
                  </>
                )
              }

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={termsAccept} onCheckedChange={(e) => {
                  if (!termsAccept) { // at click, open the privacy modal
                    setOpenTerms(true)
                    return
                  }
                  setAcceptTerms(e as boolean) // when it's true, remove the check
                }} />
                <label
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the <PolicyContainer
                    content="termscondition"
                    title="Terms & conditions"
                    className="text-prm underline cursor-pointer"
                    setAccept={(value: boolean) => setAcceptTerms(value)}
                    interactive={openTerms}
                    setInteractive={(value: boolean) => setOpenTerms(value)}
                    singlemode
                  />.
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={privacyAccept} onCheckedChange={(e) => {
                  if (!privacyAccept) { // at click, open the privacy modal
                    setOpenPrivacy(true)
                    return
                  }
                  setPrivacyAccept(e as boolean) // when it's true, remove the check
                }} />
                <label
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the <PolicyContainer
                    content="privacypolicy"
                    title="Privacy & cookie policy"
                    className="text-prm underline cursor-pointer"
                    setAccept={(value: boolean) => setPrivacyAccept(value)}
                    interactive={openPrivacy}
                    setInteractive={(value: boolean) => setOpenPrivacy(value)}
                    singlemode
                  />.
                </label>
              </div>


              <ApplyCoupons
                activeCoupons={activeCoupons}
                setActiveCoupons={setActiveCoupons}
                subtotal={calculation.subtotal}
                type={packagedata.type}
              />
              <Button
                className="w-full bg-prm"
                onClick={() => proceedToPayment()}
                disabled={(Object.values(guestCount).reduce((a, b) => a + b, 0) > (packagedata.maxpax * sets)) || !termsAccept || !privacyAccept}
              >Proceed to payment</Button>

              <p className="text-xs text-gray-500">Vat tax of &#8369;{calculation.vat.toLocaleString()} already included.</p>
              <FormError message={errorMessage} />

              {
                packagedata.type == "cottage" && (
                  <>
                    <p>Estimated entrance fees</p>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p>Adult/s</p>
                      <p>&#8369; {
                        (guestCount.adults * reservationConfig.adults).toLocaleString()
                      }</p>
                    </div>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p>Senior/PWD</p>
                      <p>&#8369; {
                        (guestCount.seniorpwds * reservationConfig.seniorpwd).toLocaleString()
                      }</p>
                    </div>
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p>Teens and kids</p>
                      <p>&#8369; {
                        (guestCount.teenkids * reservationConfig.teenkids).toLocaleString()
                      }</p>
                    </div>
                    <Separator />
                    <div className="w-full flex justify-between text-xs pl-2">
                      <p>Total</p>
                      <p>&#8369; {
                        ((guestCount.adults * reservationConfig.adults) + (guestCount.seniorpwds * reservationConfig.seniorpwd) + (guestCount.teenkids * reservationConfig.teenkids)).toLocaleString()
                      }</p>
                    </div>
                  </>
                )
              }
            </div>
          </>
        )
      }
      <AgreementDialog openAgreement={openAgreement} setOpenAgreement={setOpenAgreement} setAgreement={setAgreement} />

      <Dialog open={openPolicy} onOpenChange={(e) => setOpenPolicy(e)}>
        <DialogContent className='max-h-[90vh] min-w-[90vw] max-w-[90vw] flex flex-col overflow-hidden px-0 sm:px-2'>
          <DialogHeader className="px-2">
            <DialogTitle>Cancellation and Refund policy</DialogTitle>
          </DialogHeader>
          <div className='h-max w-full space-y-2 px-2 pb-5 text-justify overflow-y-auto scroll' dangerouslySetInnerHTML={{ __html: cancellationpolicy }}>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={errorMode != null} onOpenChange={(e) => setErrorMode(null)}>
        <DialogContent className="" disableclose={!errorMode?.closable}>
          <DialogHeader>
            <DialogTitle className="text-red-500">{errorMode?.title}</DialogTitle>
            <DialogDescription>{errorMode?.description}</DialogDescription>
            {
              errorMode?.showClose && (
                <Button onClick={() => setErrorMode(null)} className="flex justify-center w-full py-2 bg-prm text-white rounded-sm">Close</Button>
              )
            }
            {
              errorMode?.showHome && (
                <Link href="/" className="flex justify-center w-full py-2 bg-prm text-white rounded-sm">Return to home page</Link>
              )
            }
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <FullCoverLoading open={prebooking} defaultOpen={false} loadingLabel="Saving the spot, please wait..." />
    </div>
  )
}