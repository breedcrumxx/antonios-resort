'use client'

import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { usePackageData } from "@/app/providers/package-data-provider";
import { Rate } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PackageControls from "./package-controls";

export default function PackagePriceSummaryWrapper({ user }: { user: UserSession }) {

  const router = useRouter()
  const { packagedata } = usePackageData()

  return (
    <div className="min-h-[300px] w-full bg-white border-[1px]">
      {
        packagedata ? (
          <>
            <div className="w-full p-4 space-y-2 border-b-[1px] border-gray-300 bg-gray-200/40">
              <div className="w-full">
                {
                  packagedata?.images.length > 0 && (
                    <img
                      className="hidden sm:block  h-auto w-full aspect-square rounded-md object-cover"
                      src={packagedata.images[0]}
                      alt="package-image"
                    />
                  )
                }
                <p className="font-semibold">{packagedata?.packagename}</p>
                <h1 className="font-semibold text-sm">{packagedata.avgratings ? packagedata.avgratings.toFixed(2) : 0} stars - {(packagedata.ratingcount || 0)} reviews</h1>
                <Rate allowHalf value={packagedata.avgratings || 0} disabled />
                <br />
                <Link href="#reviews" className="text-xs underline">View all reviews</Link>
                <br />
              </div>
              <Separator />
              {
                packagedata.day_tour.status && (
                  <div className="w-full flex justify-between text-sm">
                    <p className="font-semibold">Day tour price</p>
                    <p className="text-sm">&#8369; {(packagedata.day_tour.price - (packagedata.day_tour.price * (packagedata.discount / 100))).toLocaleString()}</p>
                  </div>
                )
              }
              {
                packagedata.night_tour.status && (
                  <div className="w-full flex justify-between text-sm">
                    <p className="font-semibold">Night tour price</p>
                    <p className="text-sm">&#8369; {(packagedata.night_tour.price - (packagedata.night_tour.price * (packagedata.discount / 100))).toLocaleString()}</p>
                  </div>
                )
              }
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Max pax</p>
                <p className="text-sm">{packagedata.maxpax}</p>
              </div>
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Max slot</p>
                <p className="text-sm">{packagedata.quantity}</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs text-justify">Available slot may differ depending on the date you select.</p>
              <Button
                className="w-full bg-prm"
                onClick={() => router.push(`/checkout?id=${packagedata.id}`)}
              >Book now</Button>
              {
                user.role.websitecontrol && (
                  <PackageControls />
                )
              }
            </div>
          </>
        ) : null
      }
    </div>
  )
}