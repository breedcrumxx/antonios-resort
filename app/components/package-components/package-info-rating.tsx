'use client'

import { Skeleton } from "@/app/components/ui/skeleton"
import { packagewithratings } from "@/lib/zod/z-schema"
import { Rate } from "antd"
import Link from "next/link"
import z from 'zod'

export default function PackageInfoRating({ packagedata }: { packagedata: z.infer<typeof packagewithratings> | null }) {

  return (
    <>
      {
        packagedata ? (
          <>
            <div className="w-full h-auto rounded-sm bg-white">
              <div className="w-full border-[1px] p-2">
                <h1 className="font-semibold uppercase">{packagedata.customname}</h1>
                <h1 className="font-semibold text-sm">{(packagedata.ratings?.rating || 0).toFixed(1)} Ratings - {packagedata.ratings?.count || 0} reviews</h1>
                <Rate allowHalf value={Math.round((packagedata.ratings?.rating || 0))} disabled />
                <br />
                <Link href="#reviews" className="text-xs underline">View all reviews</Link>
                <br />
                <br />
                <p className="w-full text-right text-sm">Created by {
                  packagedata.creator.role.websitecontrol ? (
                    "Admin"
                  ) : (
                    packagedata.creator.firstname
                  )
                }</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-auto rounded-sm bg-white">
            <div className="w-full border-[1px] p-2 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/6" />
              <br />
              <Skeleton className="h-4 w-full" />
              <div className="w-full flex justify-end">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}