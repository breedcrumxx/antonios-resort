'use client'

import PackageCard from "@/app/(home)/package/package-components/package-card"
import { DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { upgradeCurrentBooking } from "@/lib/actions/booking-actions/upgrade-booking"
import CooldownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { balancerecord, bookingrecord, extendedpackageoffer } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { Empty, message } from "antd"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function UpgradePackage({ booking }: { booking: z.infer<typeof bookingrecord> }) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [procesing, setProcessing] = useState<boolean>(false)

  // values
  const [packages, setPackages] = useState<z.infer<typeof extendedpackageoffer>[]>([])
  const [selectedPackage, setSelectedPackage] = useState<z.infer<typeof extendedpackageoffer>>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // maxpax
        // date range
        const response = await axios.get(`/api/packages/offers/upgrade/${booking.packageid}?max=${booking.package.maxpax}&range=${encodeURI(JSON.stringify({ from: booking.checkin, to: booking.checkout }))}&slot=${booking.slot}&type=${booking.package.type}`)
        setLoading(false)
        console.log(response.data)
        setPackages(response.data)
      } catch (error) {
        console.log(error)
        message.error("Unable to get upgrade suggestions!")
      }
    }

    fetchData()
  }, [])

  const handleUpgrade = async () => {
    if (!selectedPackage) {
      message.error("Unable to upgrade your booking!")
      return
    }
    // todo: add to the balance the difference in price of upgrades
    // change the total of the booking
    // adjust the cottage to full payment mandatory

    let newsetprice = 0
    if (booking.slot == "regular") newsetprice = selectedPackage.regular_stay.price
    if (booking.slot == "day") newsetprice = selectedPackage.day_tour.price
    if (booking.slot == "night") newsetprice = selectedPackage.night_tour.price

    // the new original set price
    const newbookingprice = (newsetprice * booking.days) * booking.quantity // price multiplied to days

    const percentsdiscount = booking.appliedcoupons
      .filter((item) => item.applicableto == booking.package.type)
      .filter((item) => item.percent)
      .reduce((a, b) => a + b.amount, 0)
    const absolutesdiscount = booking.appliedcoupons
      .filter((item) => item.applicableto == booking.package.type)
      .filter((item) => !item.percent)
      .reduce((a, b) => a + b.amount, 0)

    // re-apply the discounts
    const absolutesdeducted = newbookingprice - absolutesdiscount
    const percentsdeducted = absolutesdeducted - (absolutesdeducted * (percentsdiscount / 100))

    const totaldiff = percentsdeducted - booking.transaction.expectedpayment

    const balance: z.infer<typeof balancerecord> = {
      id: "",
      bookingid: booking.id,
      type: "",
      record: ``,
      total: totaldiff
    }

    setProcessing(true)
    const response = await upgradeCurrentBooking(booking.id, selectedPackage.id, percentsdeducted, balance)
    setProcessing(false)

    if (response.status == 404 || response.status == 500) {
      message.error("Unable to upgrade your current package!")
      return
    }

    message.success("Upgraded successfully!")
    window.location.reload()
    router.refresh()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upgrade current package</DialogTitle>
        <DialogDescription>Upgrade your current package to similar higher package available</DialogDescription>
      </DialogHeader>
      <div className="flex-grow px-4 space-y-2 overflow-y-auto scroll">
        {
          loading ? (
            <div className="flex py-10 justify-center items-center">
              <Spinner label="Getting upgrade suggestions..." />
            </div>
          ) : packages.length == 0 && (
            <div className="flex py-10 justify-center items-center">
              <Empty
                description="You have the best package available we can offer!"
              />
            </div>
          )
        }
        {
          packages
            .sort((a, b) => a.maxpax - b.maxpax)
            .map((item, i) => (
              <PackageCard
                data={item}
                handleUpgrade={(data: z.infer<typeof extendedpackageoffer>) => setSelectedPackage(data)}
                key={i}
                slot={booking.slot}
                onScan
              />
            ))
        }
      </div>
      {
        selectedPackage && (
          <CooldownDialog
            open={selectedPackage != undefined}
            close={() => setSelectedPackage(undefined)}
            title="Upgrading to a higher package"
            description="Are you sure?"
            cooldown={5}
            accept={() => handleUpgrade()}
            body={
              <>
                <p className="text-sm text-justify">By changing the current package, <span className="text-blue-500">additional fees</span> may apply. Please notify the client and ask for the payment before proceeding to check-in, Thank you.</p>
              </>
            }
            proceed="Upgrade"
            proceedstyle="bg-prm"
            proceedvariant={"default"}
          />
        )
      }
      <FullCoverLoading open={procesing} defaultOpen={false} loadingLabel="Upgrading, please wait..." />
    </>
  )
}