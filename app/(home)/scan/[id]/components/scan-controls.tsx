'use client'

import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { useTabs } from "@/app/providers/tab-provider"
import { checkinBooking, checkoutBooking } from "@/lib/actions/booking-actions/booking-scan-actions"
import { ReservationConfigType } from "@/lib/configs/config-file"
import { useEdgeStore } from "@/lib/edgestore"
import { b64ToFile } from "@/lib/utils/b64-blob"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import InterruptDialog from "@/lib/utils/interrupt-dialog"
import { balancerecord, bookingrecord, bookingsession, legals } from "@/lib/zod/z-schema"
import { message } from "antd"
import { add, differenceInHours, format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useStatement } from "../statement-provider"
import SignPad from "./sign-pad"

export default function ScanControls({
  data,
  reservationconfig,
}: {
  data: z.infer<typeof bookingrecord>,
  reservationconfig: ReservationConfigType
}) {

  const { dev } = useDevs()
  const router = useRouter()
  const { setTab } = useTabs()
  const { setStatement } = useStatement()
  const { edgestore } = useEdgeStore()

  //states
  const [openReminder, setOpenReminder] = useState<boolean>(false)
  const [openDeduction, setOpenDeduction] = useState<boolean>(false)
  const [reminder, setReminder] = useState<boolean>(false)
  const [loading, setLoading] = useState<string>("")
  const [openEarlyCheckout, setOpenEarlyCheckout] = useState<boolean>(false)
  const [openSign, setOpenSign] = useState<boolean>(false)
  const [interruptContent, setInterruptContent] = useState<React.ReactNode>()

  const [headCounts, setHeadCounts] = useState<{
    adult: number,
    senior: number,
    teens: number,
    celebrant: number,
  }>({
    adult: 0,
    senior: 0,
    teens: 0,
    celebrant: 0,
  })
  const [totalFees, setTotalFees] = useState<number>(0)

  // values
  const [earlyCheckinPenalty, setEarlyCheckinPenalty] = useState<number>(0)
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [routineChecks, setRoutineChecks] = useState({
    rem1: false,
    rem2: false,
    rem3: false,
    rem4: data.package.type != "cottage" ? false : true,
  })
  const [sign, setSign] = useState<string>("")
  const [refundableDeposit, setRefundableDeposit] = useState<number>(0)
  const [deductables, setDeductables] = useState<number>(0)

  useEffect(() => {

    setRefundableDeposit(data.legal?.amount || 0)

    if ((new Date(data.checkin).setHours(0, 0, 0, 0) != new Date().setHours(0, 0, 0, 0))) {

      if (dev.DEBUG && dev.scan.allowunscheduled) {
        return
      }

      message.error('This booking is not scheduled for today!')
      setInterruptContent(<>
        <DialogHeader>
          <DialogTitle className="text-red-500">Not Scheduled for Today!</DialogTitle>
          <DialogDescription>This booking is not scheduled for today, please notify the client&apos;s to come back on the scheduled date, Thank you.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.push("/")}>Back to home page</Button>
          <Button className="bg-prm" onClick={() => router.push("/scan")}>Scan again</Button>
        </DialogFooter>
      </>)
    }

  }, [])

  useEffect(() => {
    // check for early check-in penalty
    let penalty = 0
    if (data.status == "Approved" && data.package.type != 'cottage') {
      if (new Date(data.checkin).getTime() > new Date().getTime()) {

        if (dev.DEBUG && dev.scan.allowunscheduled) {
          return
        }

        // show uninterrupted modal warning of not yet on schedule
        message.error('This booking is not scheduled for today!')
        setInterruptContent(<>
          <DialogHeader>
            <DialogTitle className="text-red-500">Not On Schedule</DialogTitle>
            <DialogDescription>This booking is not yet ready for check-in, please check-in at the exact date of booking schedule, thank you.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/")}>Back to home page</Button>
            <Button className="bg-prm" onClick={() => router.push("/scan")}>Scan again</Button>
          </DialogFooter>
        </>)
      }
    }

    if (data.status == "Ongoing") { // calculate the checkout penalty for events
      if (data.package.type == "event") {
        const checkin = data.bookinglog.find((item) => item.status = "Check-in") as z.infer<typeof bookingsession>
        let duration = 0

        if (data.slot == "day") {
          duration = data.package.day_tour.duration
        }
        if (data.slot == "night") {
          duration = data.package.night_tour.duration
        }

        const estimatedcheckout = add(checkin.log_at, { hours: duration })

        if (estimatedcheckout.getTime() < new Date().getTime()) { // time exeeded
          penalty = Math.ceil(Math.max(differenceInHours(new Date(data.checkin), new Date()), 1)) * reservationconfig.checkincheckoutpenalty
        }
      }

      if (data.package.type == "villa") { // calculate the penalty for villas late checkout
        if (new Date(data.checkout) < new Date()) {
          penalty = Math.ceil(Math.max(differenceInHours(new Date(data.checkout), new Date()), 1)) * reservationconfig.checkincheckoutpenalty
        }
      }

      setEarlyCheckinPenalty(penalty)
    }

    const adultfees = headCounts.adult * reservationconfig.adults
    const seniorfees = headCounts.senior * reservationconfig.seniorpwd
    const teenfees = headCounts.teens * reservationconfig.teenkids
    const totalfees = adultfees + seniorfees + teenfees
    setTotalFees(totalfees)

    const unpaidbalances = data.balance
      .filter((item) => item.type != "Security deposit")
      .reduce((a, b) => a + b.total, 0)

    const additionals = data.package.type != 'cottage' && data.status == "Approved" ? reservationconfig.securitydeposit : 0

    setTotalBalance(penalty + totalfees + unpaidbalances + additionals)

  }, [headCounts])

  const proceedToCheckin = async () => {

    // check for matching date
    if (new Date(data.checkin).setHours(0, 0, 0, 0) != new Date().setHours(0, 0, 0, 0)) {
      if (dev.DEBUG && dev.scan.allowstart) {
      } else {
        message.error('This booking is not scheduled for today!')
        return
      }
    }

    if (totalBalance > 0 && !reminder) {
      setOpenReminder(true)
      message.error("Unpaid balances!")
      return
    }

    if (sign.length == 0 && data.package.type != 'cottage') {
      setOpenSign(true)
      return
    }

    const insertbalance = balancerecord.omit({
      id: true,
      bookingid: true,
    })

    const balances: z.infer<typeof insertbalance>[] = []

    if (totalFees > 0) { // entrance fees
      const adultfees = headCounts.adult * reservationconfig.adults
      const seniorfees = headCounts.senior * reservationconfig.seniorpwd
      const teenfees = headCounts.teens * reservationconfig.teenkids

      const collection: z.infer<typeof insertbalance>[] = []

      if (adultfees > 0) {
        collection.push({
          type: "Entrance",
          record: `Balance of ₱ ${adultfees.toLocaleString()} for adult entrance fees.`,
          total: adultfees
        }, {
          type: "Entrance payment",
          record: `Balance of ₱ ${adultfees.toLocaleString()} paid.`,
          total: parseFloat("-" + adultfees)
        })
      }
      if (seniorfees > 0) {
        collection.push({
          type: "Entrance",
          record: `Balance of ₱ ${seniorfees.toLocaleString()} for senior/PWD entrance fees.`,
          total: seniorfees
        }, {
          type: "Entrance payment",
          record: `Balance of ₱ ${seniorfees.toLocaleString()} paid.`,
          total: parseFloat("-" + seniorfees)
        })
      }
      if (teenfees > 0) {
        collection.push({
          type: "Entrance",
          record: `Balance of ₱ ${teenfees.toLocaleString()} for teen/kid entrance fees.`,
          total: teenfees
        }, {
          type: "Entrance payment",
          record: `Balance of ₱ ${teenfees.toLocaleString()} paid.`,
          total: parseFloat("-" + teenfees)
        })
      }

      balances.push(...collection)
    }

    const unpaidbalances = data.balance.reduce((a, b) => a + b.total, 0)

    if (unpaidbalances > 0) {
      balances.push({
        type: "Balance payment",
        record: `Total of ₱ ${unpaidbalances.toLocaleString()} balance has been paid`,
        total: parseFloat("-" + unpaidbalances)
      })
    }

    let signurl = ""
    const insertlegals = legals.omit({ id: true, refunded_on: true })
    let legal: z.infer<typeof insertlegals> | null = null

    if (data.package.type != "cottage") {
      setLoading("Proceeding to check-in, please wait...")
      try {
        const res = await edgestore.publicImages.upload({
          file: b64ToFile(sign, "sign.png", 'image/png'),
          options: {
            temporary: true,
          }
        })

        signurl = res.url
      } catch (error) {
        message.error("Cannot save the signature, please try again later!")
        setLoading("")
        return
      }

      balances.push({
        type: "Security deposit",
        record: `Deposit of ₱ ${reservationconfig.securitydeposit.toLocaleString()} for breakage.`,
        total: parseFloat("-" + reservationconfig.securitydeposit)
      })

      legal = {
        paid_on: new Date(),
        amount: reservationconfig.securitydeposit,
        refunded_amount: 0,
        signature: signurl,
      }
    }

    setLoading("Proceeding to check-in, please wait...")
    const response = await checkinBooking(data.id, balances, legal, headCounts, data.package.type == "cottage")
    setLoading("")

    if (response.status == 500) {
      message.error("An error occured, unable to proceed!")
      return
    }

    setStatement(`Successfully checked-in, please assist them to the resort. This session ends at ${format(data.checkout, "PPP hh:mm a")}`)
    setTab("success")
  }

  const proceedToCheckOut = async () => {
    if (data.package.type != "cottage" && new Date(data.checkout).getTime() > new Date().getTime()) {

      if (dev.DEBUG && dev.scan.allowend) { // debug controll line, disable dev mode on production
      } else {
        setOpenEarlyCheckout(true)
        return
      }
    }

    if (totalBalance > 0 && !reminder) {
      setOpenReminder(true)
      message.error("Unpaid balances!")
      return
    }

    const insertbalance = balancerecord.omit({
      id: true,
      bookingid: true,
    })

    const balances: z.infer<typeof insertbalance>[] = []

    if (earlyCheckinPenalty > 0) { // check-out penalties
      balances.push({
        type: "Penalty",
        record: `Late check-out penalty of ₱ ${earlyCheckinPenalty.toLocaleString()}`,
        total: earlyCheckinPenalty
      },
        {
          type: "Penalty payment",
          record: `Penalty payment of ₱ ${earlyCheckinPenalty.toLocaleString()}`,
          total: parseFloat("-" + earlyCheckinPenalty)
        }
      )
    }

    const unpaidbalances = data.balance.reduce((a, b) => a + b.total, 0)

    if (unpaidbalances > 0) {
      balances.push({
        type: "Balance payment",
        record: `Total of ₱ ${unpaidbalances.toLocaleString()} balance has been paid.`,
        total: parseFloat("-" + unpaidbalances)
      })
    }

    if (deductables > 0) {
      balances.push({
        type: "Breakage",
        record: `Total of ₱ ${deductables.toLocaleString()} breakage.`,
        total: deductables
      })
    }

    if (refundableDeposit > 0) {
      balances.push({
        type: "Deposit refunded",
        record: `Total of ₱ ${(refundableDeposit - deductables).toLocaleString()} refunded.`,
        total: (refundableDeposit - deductables)
      })
    }

    setLoading("Checking-out, please wait...")
    const response = await checkoutBooking(data.id, data.package.id, balances, refundableDeposit - deductables, data.package.type != "cottage")
    setLoading("")

    if (response.status == 500) {
      message.error("Unable to check-out the booking.")
      return
    }

    setTab("ended")
  }

  const checkAvailability = () => {
    if (data.status != "Approved") return true
    // disable if the pax exceeded the max pax
    if (Object.values(headCounts).reduce((a, b) => a + b, 0) > (data.package.maxpax * data.quantity)) return true
    // dont allow 0 head counts when it's cottage package 
    if ((headCounts.adult + headCounts.senior + headCounts.teens) == 0 && data.slot == "regular") return true
    if (new Date(data.checkin).setHours(0, 0, 0, 0) != new Date().setHours(0, 0, 0, 0) && !(dev.DEBUG && dev.scan.allowunscheduled)) return true
    return false
  }

  return (
    <>
      <div className="bg-white h-max w-1/4 space-y-2">
        <div className="border h-max w-full p-4 space-y-2">
          {
            data.status == "Ongoing" ? (
              <>
                <p className="font-semibold capitalize">Proceeding to check-out</p>
                <Separator />
                <div className="w-full flex justify-between text-sm">
                  <p className="font-semibold">Unpaid balance</p>
                  <p>&#8369; {data.balance.filter((item) => item.type != "Security deposit").reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
                </div>
                {
                  data.package.type != 'cottage' && (
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold text-blue-500 cursor-pointer hover:underline">Refundable deposit</p>
                      <p>&#8369; {(refundableDeposit - deductables).toLocaleString()}</p>
                    </div>
                  )
                }
                {
                  earlyCheckinPenalty > 0 && (
                    <>
                      <div className="w-full flex justify-between text-sm">
                        <p className="font-semibold">Late check-out penalty</p>
                        <p>&#8369; {earlyCheckinPenalty.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-justify">{data.status == "Ongoing" ? "Late check-out" : "Early check-in"} penalty are the amount to pay per hour difference in the scheduled {data.status == "Ongoing" ? "check-out" : "check-in"}. Penalty amount per hour &#8369; {reservationconfig.checkincheckoutpenalty.toLocaleString()}</p>
                    </>
                  )
                }
                {
                  data.package.type != "cottage" && (
                    <div className="flex gap-1">
                      <Checkbox checked={routineChecks.rem4} onCheckedChange={(e) => {
                        setRoutineChecks((prev) => ({ ...prev, rem4: e as boolean }))
                        if (e) setOpenDeduction(true)
                      }} />
                      <p className="text-xs text-justify">Check for breakage and calculate the total of refundable security deposit.
                      </p>
                    </div>
                  )
                }
                <div className="flex gap-1">
                  <Checkbox checked={routineChecks.rem1} onCheckedChange={(e) => setRoutineChecks((prev) => ({ ...prev, rem1: e as boolean }))} />
                  <p className="text-xs text-justify">Please remind the clients to check for their belongings before checking-out.
                  </p>
                </div>
                <div className="flex gap-1">
                  <Checkbox checked={routineChecks.rem2} onCheckedChange={(e) => setRoutineChecks((prev) => ({ ...prev, rem2: e as boolean }))} disabled={!routineChecks.rem1} />
                  <p className="text-xs text-justify">Double-check that all room amenities are in good condition and nothing is damaged or missing.</p>
                </div>
                <div className="flex gap-1">
                  <Checkbox checked={routineChecks.rem3} onCheckedChange={(e) => setRoutineChecks((prev) => ({ ...prev, rem3: e as boolean }))} disabled={!routineChecks.rem2} />
                  <p className="text-xs text-justify">Remind the guest to give their feedbacks on the website about their stay.</p>
                </div>
                <Separator />
              </>
            ) : (
              <>
                {
                  data.slot == "regular" ? (
                    <>
                      <p className="font-semibold capitalize">Entrance fee rates</p>
                      <div className="w-full flex justify-between text-sm pl-2">
                        <p className="font-semibold">Adult</p>
                        <p>&#8369; {reservationconfig.adults.toLocaleString()}</p>
                      </div>
                      <div className="w-full flex justify-between text-sm pl-2">
                        <p className="font-semibold">Senior/PWD</p>
                        <p>&#8369; {reservationconfig.seniorpwd.toLocaleString()}</p>
                      </div>
                      <div className="w-full flex justify-between text-sm pl-2">
                        <p className="font-semibold">Teens/kids</p>
                        <p>&#8369; {reservationconfig.teenkids.toLocaleString()}</p>
                      </div>
                      <Separator />
                      <div className="pl-2 flex justify-between items-center">
                        <Label>Adults:</Label>
                        <Input className="w-1/2" type="number" min={0} value={headCounts.adult} onChange={(e) => setHeadCounts((prev) => ({ ...prev, adult: parseInt(e.target.value) }))} placeholder="..." />
                      </div>
                      <div className="pl-2 flex justify-between items-center">
                        <Label>Senior/PWD:</Label>
                        <Input className="w-1/2" type="number" min={0} value={headCounts.senior} onChange={(e) => setHeadCounts((prev) => ({ ...prev, senior: parseInt(e.target.value) }))} placeholder="..." />
                      </div>
                      <div className="pl-2 flex justify-between items-center">
                        <Label>Teens/Kids:</Label>
                        <Input className="w-1/2" type="number" min={0} value={headCounts.teens} onChange={(e) => setHeadCounts((prev) => ({ ...prev, teens: parseInt(e.target.value) }))} placeholder="..." />
                      </div>
                      <div className="pl-2 flex justify-between items-center">
                        <Label>Celebrants:</Label>
                        <Input className="w-1/2" type="number" min={0} value={headCounts.celebrant} onChange={(e) => setHeadCounts((prev) => ({ ...prev, celebrant: parseInt(e.target.value) }))} placeholder="..." />
                      </div>
                      <p className="text-xs text-gray-500">Birthday Celebrants are free!</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold capitalize">Balances summary</p>
                    </>
                  )
                }
                <Separator />
                <div className="w-full flex justify-between text-sm">
                  <p className="font-semibold">Unpaid balance</p>
                  <p>&#8369; {data.balance.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
                </div>
                {
                  data.package.type != "cottage" && (
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Security deposit</p>
                      <p>&#8369; {reservationconfig.securitydeposit.toLocaleString()}</p>
                    </div>
                  )
                }
                {
                  data.slot == "regular" && (
                    <div className="w-full flex justify-between text-sm">
                      <p className="font-semibold">Entrance fees</p>
                      <p>&#8369; {totalFees.toLocaleString()}</p>
                    </div>
                  )
                }
                {/* {
                  earlyCheckinPenalty > 0 && (
                    <>
                      <div className="w-full flex justify-between text-sm">
                        <p className="font-semibold">Early check-in penalty</p>
                        <p>&#8369; {earlyCheckinPenalty.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-justify">Early check-in penalty are the amount to pay per hour difference in the scheduled check-in. Penalty amount per hour &#8369; {reservationconfig.checkincheckoutpenalty.toLocaleString()}</p>
                    </>
                  )
                } */}

                <Separator />
                <div className="w-full flex justify-between text-md">
                  <p className="font-semibold">Amount to pay</p>
                  <p>&#8369; {totalBalance.toLocaleString()}</p>
                </div>
                <p className="text-xs text-blue-500">Be sure to collect the <span className="underline font-semibold">Amount-to-Pay</span> before checking-in.</p>
              </>
            )
          }

          {
            (Object.values(headCounts).reduce((a, b) => a + b, 0)) > (data.package.maxpax * data.quantity) && (
              <p className="text-xs text-justify text-red-500">Guest count exceeded the max pax of the current package, consider upgrading to a higher package.</p>
            )
          }

          {
            data.status != "Ongoing" ? (
              <Button
                className="bg-prm w-full"
                onClick={() => proceedToCheckin()}
                disabled={checkAvailability()}>Check-in</Button>
            ) : (
              <>
                <p className="text-xs text-justify text-blue-500">Please ensure that all the routine checks are performed before proceeding to check-out.</p>
                <Button
                  className="bg-prm w-full"
                  onClick={() => proceedToCheckOut()}
                  disabled={Object.values(routineChecks).some((item) => item == false)}>Check-out</Button>
              </>
            )
          }

          <Button variant="outline" className="w-full" onClick={() => router.push('/scan')}>Scan another booking</Button>
        </div>

        {
          sign.length > 0 && (
            <div className="border h-max w-full p-4 space-y-2">
              <p className="font-semibold capitalize">Client&apos;s Signature</p>
              <div>
                <img src={sign} alt="client-sign" />
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => { setSign(""); setOpenSign(true) }}>Re-take</Button>
            </div>
          )
        }
      </div>

      <Dialog open={openDeduction} onOpenChange={(e) => setOpenDeduction(e)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refundable security deposit</DialogTitle>
            <DialogDescription>Deduct the total of breakage from to calculate the refundable security deposit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label>Security deposit</Label>
              <Input value={refundableDeposit} readOnly />
            </div>
            <div>
              <Label>Deduction</Label>
              <Input
                type="number"
                min={0}
                max={refundableDeposit}
                value={deductables}
                onChange={(e) => setDeductables(parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Refundable security deposit</Label>
              <Input value={refundableDeposit - deductables} readOnly />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-prm" onClick={() => setOpenDeduction(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openSign} onOpenChange={(e) => setOpenSign(e)}>
        <DialogContent className="w-max">
          <DialogHeader>
            <DialogTitle>Client&apos;s Signature</DialogTitle>
          </DialogHeader>
          <SignPad
            setSign={(image: string) => { setSign(image); setOpenSign(false) }}
            close={() => setOpenSign(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openReminder} onOpenChange={() => setOpenReminder(false)}>
        <DialogContent disableclose>
          <DialogHeader>
            <DialogTitle>Booking Balance Reminder!</DialogTitle>
            <DialogDescription>This booking has remaining unpaid balance.</DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-center">Total of<span className="font-semibold text-2xl"> &#8369; {
              totalBalance.toLocaleString()
            }</span> unpaid balance.</p>
            <br />
            <p className="text-sm opacity-70 text-justify">Remember to collect the unpaid balance from the client before starting the booking session.</p>
          </div>
          <DialogFooter>
            <Button variant={"ghost"} onClick={() => setOpenReminder(false)}>
              Hold on
            </Button>
            <Button
              className="bg-prm"
              onClick={() => {
                setReminder(true)
                setOpenReminder(false)
              }}>Already paid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEarlyCheckout} onOpenChange={() => setOpenEarlyCheckout(false)}>
        <DialogContent disableclose>
          <DialogHeader>
            <DialogTitle>Checking-out Too Early?</DialogTitle>
            <DialogDescription>We cannot allow the crew to check out this booking too early. This is to reduce the risk of crew errors. Please refer to the client and have them complete the check-out themselves on their profile page. Thank you.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-prm"
              onClick={() => setOpenEarlyCheckout(false)}>Ok, got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InterruptDialog open={interruptContent != undefined}>
        {interruptContent}
      </InterruptDialog>

      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </>
  )
}