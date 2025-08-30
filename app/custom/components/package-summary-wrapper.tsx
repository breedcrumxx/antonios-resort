'use client'

import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { createPackage, updatePackage } from "@/lib/actions/custompackage-actions/package-actions"
import { FormError } from "@/lib/ui/form-banners"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { packageoffer } from "@/lib/zod/z-schema"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { useCustomPackage } from "../provider"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

export default function PackageSummaryWrapper({ user }: { user: UserSession }) {

  const router = useRouter()

  // context
  const {
    packageid,
    packageName,
    packageDescription,
    inclusions,
    mode,
    imageUrls,
    maxPax,
    maxQuantity,
    packageType,
    schedules,
    discount,
    setDiscount,
  } = useCustomPackage()
  // console.log(packageType)

  // states
  const [loading, setLoading] = useState<string>('')
  const [error, setError] = useState<string>("")

  const handleSavePackage = async () => {
    setError("")

    if (packageName.length == 0 || packageDescription.length == 0) {
      message.error("Please provide a package name and description!")
      return
    }
    if (!packageType.length) {
      message.error("Please select a package type!")
      return
    }
    if (maxPax < 2 || maxQuantity <= 0) {
      return
    }
    if (schedules.day.status && (schedules.day.timein.length == 0 || (schedules.day.price < 1000 || Number.isNaN(schedules.day.price)) || schedules.day.duration < 5)) {
      message.error("Please fill out the day tour form!")
      return
    }
    if (schedules.night.status && (schedules.night.timein.length == 0 || (schedules.night.price < 1000 || Number.isNaN(schedules.night.price)) || schedules.night.duration < 5)) {
      message.error("Please fill out the night tour form!")
      return
    }
    if (schedules.regular.status && (schedules.regular.timein.length == 0 || (schedules.regular.price < 200 || Number.isNaN(schedules.regular.price)) || schedules.regular.timeout.length == 0)) {
      message.error("Please fill out the schedule form!")
      return
    }
    if (imageUrls.length < 7) {
      message.error("Please upload at least 7 images!")
      setError("Need at least 7 images!")
      return
    }
    if (inclusions.length < 4) {
      setError("Please write at least 4 package inclusions!")
      return
    }

    if (mode == "create") {
      const createPackageType = packageoffer.omit({
        id: true,
      })

      const data: z.infer<typeof createPackageType> = {
        packagename: packageName,
        packagedescription: packageDescription,
        maxpax: maxPax,
        status: "active",

        type: packageType, // VILLA = can be continued | EVENT = continues false | COTTAGE = continues false
        day_tour: JSON.stringify(schedules.day),
        night_tour: JSON.stringify(schedules.night),
        regular_stay: JSON.stringify(schedules.regular),

        penaltyamount: 0, // exclude on cottages
        extendable: false, // only available to events
        extendprice: 0, // only available to events
        discount: discount,

        inclusion: inclusions,
        quantity: maxQuantity,
        images: imageUrls,
      }

      setLoading("Creating package please wait...")
      const response = await createPackage(data)
      setLoading("")

      if (response.status == 500) {
        message.error("Unable to create the package, please try again later!")
        return
      }

      router.push(`/custom/success/created/${response.data}`)
    } else { // update

      const data: z.infer<typeof packageoffer> = {
        id: packageid as string,
        packagename: packageName,
        packagedescription: packageDescription,
        maxpax: maxPax,
        status: "active",

        type: packageType, // VILLA = can be continued | EVENT = continues false | COTTAGE = continues false
        day_tour: JSON.stringify(schedules.day),
        night_tour: JSON.stringify(schedules.night),
        regular_stay: JSON.stringify(schedules.regular),

        penaltyamount: 0, // exclude on cottages
        extendable: false, // only available to events
        extendprice: 0, // only available to events
        discount: discount,

        inclusion: inclusions,
        quantity: maxQuantity,
        images: imageUrls,
      }

      setLoading("Updating package, please wait...")
      const response = await updatePackage(data)
      setLoading("")

      if (response.status == 500) {
        message.error("Unable to create the package, please try again later!")
        return
      }

      router.push(`/package`)
    }
  }


  return (
    <div className="h-max w-full bg-white border-[1px]">
      <div className="w-full p-4 space-y-2 border-b-[1px] border-gray-300 bg-gray-200/40">
        <div className="w-full">
          {
            imageUrls.length > 0 && (
              <img
                className="h-auto w-full aspect-square rounded-md object-cover"
                src={imageUrls[0]}
                alt="package-image"
              />
            )
          }
          <p className="font-semibold">{packageName}</p>
          <p className="text-xs text-justify">{packageDescription}</p>
        </div>
        <Separator />
        <div className="w-full flex justify-between items-center text-sm">
          <p className="font-semibold">Max pax</p>
          <p className="">{maxPax}</p>
        </div>
        <div className="w-full flex justify-between items-center text-sm">
          <p className="font-semibold">Available quantity</p>
          <p className="">{maxQuantity}</p>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {
          packageType.length == 0 ? (
            <p className="text-sm text-center py-4">Please select a type first...</p>
          ) : packageType != "cottage" ? (
            <>
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Day tour</p>
                <p className="">&#8369; {(schedules.day.price || 0).toLocaleString()}</p>
              </div>
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Night tour</p>
                <p className="">&#8369; {(schedules.night.price || 0).toLocaleString()}</p>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-between text-sm">
              <p className="font-semibold">Cottage price</p>
              <p className="">&#8369; {(schedules.regular.price || 0).toLocaleString()}</p>
            </div>
          )
        }

        <div>
          <Label htmlFor="discount">Apply a discount</Label>
          <Input
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
            type="number"
            min={0}
            max={30}
            placeholder="apply a discount..." />
        </div>

        <FormError message={error} />
        {
          mode == "create" ? (
            <Button className="w-full bg-prm" onClick={() => handleSavePackage()}>Create package</Button>
          ) : (
            <Button className="w-full bg-prm" onClick={() => handleSavePackage()}>Update package</Button>
          )
        }
        <p className="text-xs text-gray-500">Upon creating, this package will be available at the offers page right away!</p>
      </div>
      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </div>
  )
}