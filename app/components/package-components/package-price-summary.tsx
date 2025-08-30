'use client'

import { Skeleton } from "@/app/components/ui/skeleton";
import { extendedbasepackage, service } from "@/lib/zod/z-schema";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import React from "react";
import z from 'zod';
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

export default function PackagePriceSummary({ children, basePackage, calculation, extra, services, className }:
  {
    children: React.ReactNode,
    basePackage: z.infer<typeof extendedbasepackage> | null,
    calculation: Calculation,
    services: z.infer<typeof service>[]
    extra?: React.ReactNode,
    className?: string
  }) {

  const searchParams = useSearchParams()

  return (
    <>
      {
        !basePackage ? (
          <div className={cn("min-h-[300px] w-full bg-white border-[1px]", className)}>
            <div className="w-full p-4 space-y-2 border-b-[1px] border-gray-300 bg-gray-200/40">
              <Skeleton className="h-4 w-full bg-gray-300" />
              <Skeleton className="h-4 w-full bg-gray-300" />
              <Skeleton className="h-4 w-full bg-gray-300" />
              <Skeleton className="h-4 w-3/4  bg-gray-300" />
            </div>
            <div className="w-full p-4 space-y-2">
              <Skeleton className="h-4 w-full " />
              <Skeleton className="h-4 w-full " />
              <Skeleton className="h-6 w-full bg-gray-300 " />
              <Skeleton className="h-2 w-full  " />
            </div>
          </div>
        ) : (
          <div className={cn("h-max w-full bg-white border-[1px]", className)}>
            <div className="w-full p-4 space-y-2 border-b-[1px] border-gray-300 bg-gray-200/40">
              <div className="w-full flex justify-between text-sm ">
                <p className="font-semibold">{basePackage.basename}</p>
                <p>&#8369; {(basePackage.baseprice * basePackage.basetype.duration).toLocaleString()}</p>
              </div>
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Features/Services</p>
                <p className={clsx({ "line-through": (calculation.less > 0) })}></p>
              </div>
              {
                services.map((item, i) => (
                  <div className="w-full flex justify-between pl-4 text-xs" key={i}>
                    <p>{item.servicename}</p>
                    <p>&#8369; {(item.price).toLocaleString()}</p>
                  </div>
                ))
              }
              <Separator />
              <div className="w-full flex justify-between text-sm">
                <p className="font-semibold">Sub-total</p>
                <p className={clsx({ "line-through": (calculation.less > 0) })}> &#8369; {(calculation.packageprice + calculation.servicestotal).toLocaleString()}</p>
              </div>
            </div>
            {extra}
            {
              calculation.less > 0 && (
                <div className="w-full flex justify-end mt-2">
                  <div className="p-1 bg-green-500">
                    <p className="text-xs text-white">{basePackage.packagediscount}% DISCOUNT</p>
                  </div>
                </div>
              )
            }
            <div className="p-4 space-y-2">
              <div className="w-full flex justify-between text-sm">
                <h1 className="font-semibold">Sub-total</h1>
                <p className={clsx({ "line-through": (calculation.less > 0) })}> &#8369; {(calculation.packageprice + calculation.servicestotal).toLocaleString()}</p>
              </div>
              <div className="w-full flex justify-between">
                <h1 className="font-semibold">Final price</h1>
                <p> &#8369; {calculation.total.toLocaleString()
                }</p>
              </div>
              <p className="text-sm font-semibold">Included in price:  <span className="font-light">VAT &#8369; {calculation.vat.toLocaleString()}</span> </p>
              {
                calculation.less > 0 && (
                  <p className="text-xs font-light">You can save &#8369; {calculation.less.toLocaleString()} on this package!</p>
                )
              }
              {
                !searchParams.get('view') && (
                  <>
                    {children}
                  </>
                )
              }
            </div>
          </div>
        )
      }
    </>
  )

}