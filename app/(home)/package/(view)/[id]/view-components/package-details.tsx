'use client'

import { Separator } from "@/app/components/ui/separator"
import { Skeleton } from "@/app/components/ui/skeleton"
import { usePackageData } from "@/app/providers/package-data-provider"
import { getTimein, getTimeout } from "@/lib/utils/package-timein-timeout"

export default function PackageDetails() {

  const { packagedata } = usePackageData()

  return (
    <>
      {
        packagedata ? (
          <>
            <div className="hidden sm:block w-full flex flex-col p-4 space-y-2 bg-white border-[1px] rounded-sm">
              <h1 className="text-2xl font-bold">{packagedata.packagename}</h1>
              <Separator />
              <p>{packagedata.packagedescription}</p>
              {
                packagedata.type == "villa" ? (
                  <div className="py-4 space-y-4">
                    {
                      packagedata.day_tour.status && (
                        <div className="w-full flex justify-around text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Day tour schedule</p>
                            <p></p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">Check-in:</p>
                            <p>{getTimein(packagedata.day_tour.timein)}</p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">Check-out:</p>
                            <p> {getTimeout(packagedata.day_tour.timein, packagedata.day_tour.duration)}</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      packagedata.night_tour.status && (
                        <div className="w-full flex justify-around text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Night tour schedule</p>
                            <p></p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">Check-in:</p>
                            <p>{getTimein(packagedata.night_tour.timein)}</p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">Check-out:</p>
                            <p> {getTimeout(packagedata.night_tour.timein, packagedata.night_tour.duration)}</p>
                          </div>
                        </div>
                      )
                    }

                  </div>
                ) : packagedata.type == "event" ? (
                  <div className="py-4 space-y-4">
                    {
                      packagedata.day_tour.status && (
                        <div className="w-full flex justify-around text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Day event schedule</p>
                            <p></p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">From:</p>
                            <p>{getTimein(packagedata.day_tour.timein)}</p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">To:</p>
                            <p> {getTimein(packagedata.day_tour.timeout)}</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      packagedata.night_tour.status && (
                        <div className="w-full flex justify-around text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Night event schedule</p>
                            <p></p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">From:</p>
                            <p>{getTimein(packagedata.night_tour.timein)}</p>
                          </div>
                          <div className="flex gap-5">
                            <p className="font-semibold">To:</p>
                            <p> {getTimein(packagedata.night_tour.timeout)}</p>
                          </div>
                        </div>
                      )
                    }
                  </div>
                ) : (
                  <div className="w-full flex justify-around text-sm">
                    <div className="flex gap-5">
                      <p className="font-semibold">Regular schedule</p>
                      <p></p>
                    </div>
                    <div className="flex gap-5">
                      <p className="font-semibold">Check-in:</p>
                      <p>{getTimein(packagedata.regular_stay.timein)}</p>
                    </div>
                    <div className="flex gap-5">
                      <p className="font-semibold">Check-out:</p>
                      <p> {getTimeout(packagedata.regular_stay.timein, packagedata.regular_stay.duration)}</p>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="block sm:hidden w-full flex flex-col p-4 space-y-2 bg-white border-[1px] rounded-sm">
              <h1 className="text-2xl font-bold">{packagedata.packagename}</h1>
              <Separator />
              <p>{packagedata.packagedescription}</p>
              {
                packagedata.type == "villa" ? (
                  <div className="py-2 space-y-4">
                    {
                      packagedata.day_tour.status && (
                        <div className="w-full text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Day tour schedule: </p>
                            <p></p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">Check-in:</p>
                            <p>{getTimein(packagedata.day_tour.timein)}</p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">Check-out:</p>
                            <p> {getTimeout(packagedata.day_tour.timein, packagedata.day_tour.duration)}</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      packagedata.night_tour.status && (
                        <div className="w-full text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Night tour schedule</p>
                            <p></p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">Check-in:</p>
                            <p>{getTimein(packagedata.night_tour.timein)}</p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">Check-out:</p>
                            <p> {getTimeout(packagedata.night_tour.timein, packagedata.night_tour.duration)}</p>
                          </div>
                        </div>
                      )
                    }

                  </div>
                ) : packagedata.type == "event" ? (
                  <div className="py-4 space-y-4">
                    {
                      packagedata.day_tour.status && (
                        <div className="w-full text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Day event schedule</p>
                            <p></p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">From:</p>
                            <p>{getTimein(packagedata.day_tour.timein)}</p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">To:</p>
                            <p> {getTimein(packagedata.day_tour.timeout)}</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      packagedata.night_tour.status && (
                        <div className="w-full text-sm">
                          <div className="flex gap-5">
                            <p className="font-semibold">Night event schedule</p>
                            <p></p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">From:</p>
                            <p>{getTimein(packagedata.night_tour.timein)}</p>
                          </div>
                          <div className="flex justify-between px-10">
                            <p className="font-semibold">To:</p>
                            <p> {getTimein(packagedata.night_tour.timeout)}</p>
                          </div>
                        </div>
                      )
                    }
                  </div>
                ) : (
                  <div className="w-full text-sm">
                    <div className="flex gap-5">
                      <p className="font-semibold">Regular schedule</p>
                      <p></p>
                    </div>
                    <div className="flex justify-between px-10">
                      <p className="font-semibold">Check-in:</p>
                      <p>{getTimein(packagedata.regular_stay.timein)}</p>
                    </div>
                    <div className="flex justify-between px-10">
                      <p className="font-semibold">Check-out:</p>
                      <p> {getTimeout(packagedata.regular_stay.timein, packagedata.regular_stay.duration)}</p>
                    </div>
                  </div>
                )
              }
            </div>

          </>
        ) : (
          <div className="w-full flex flex-col p-4 space-y-2 bg-white border-[1px] rounded-sm">
            <Skeleton className="h-8 w-full" />
            <Separator />
            <Skeleton className="h-6 w-full" />
            <div className="w-full flex justify-around py-4 text-sm">
              <Skeleton className="w-1/6 h-4" />
              <Skeleton className="w-1/6 h-4" />
              <Skeleton className="w-1/6 h-4" />
            </div>
          </div>
        )
      }
    </>
  )
}