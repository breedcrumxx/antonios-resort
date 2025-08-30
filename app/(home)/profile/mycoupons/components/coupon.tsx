'use client'

import { cn } from "@/lib/utils/cn"
import { extendedcoupons } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { cva } from "class-variance-authority"
import { format } from "date-fns"
import { CheckCheck } from "lucide-react"
import { z } from "zod"

interface CouponProps extends
  React.HTMLAttributes<HTMLDivElement> {
  item: z.infer<typeof extendedcoupons>,
  isGrabbed?: boolean;
  variant?: "default" | "disabled" | "used" | "maxed" | "loading" | "claimed",
}

const couponvariant = cva(
  "w-full bg-white h-max p-2 text-center rounded-tl-md rounded-bl-md shadow cursor-pointer relative",
  {
    variants: {
      variant: {
        default: "text-prm",
        disabled: "text-gray-500 pointer-events-none",
        used: "text-gray-500 pointer-events-none",
        maxed: "text-gray-500 pointer-events-none",
        claimed: "text-prm pointer-events-none",
        loading: "text-gray-500 pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export default function Coupon({ item, variant = "default", isGrabbed, ...prop }: CouponProps) {

  return (
    <div
      {...prop}
      className={cn(prop.className, couponvariant({ variant }))}
    >
      <div className="p-2 border rounded-sm relative" >
        {
          variant == "used" ? (
            <p className="absolute text-red-500 font-bold -rotate-90 top-1/2 left-2 -translate-y-2/4 text-2xl">USED</p>
          ) : variant == "maxed" ? (
            <p className="absolute text-red-500 font-bold -rotate-90 top-1/2 left-2 -translate-y-2/4 text-xl">RAN OUT</p>
          ) : variant == "loading" ? (
            <Spinner
              className="absolute top-2 right-2"
              size="sm" />
          ) : variant == "claimed" && (
            <CheckCheck className="absolute top-2 right-2 w-4 h-4 text-green-500" />
          )
        }
        <p className="text-xs">Discount coupon</p>
        <p className="text-2xl font-bold">{item.couponcode}</p>
        <p className="text-xs text-gray-500">Less {!item.percent && "₱"}{item.amount}{item.percent && "%"} on {item.applicableto} price.</p>
        <p className="text-xs text-center">{item.minamount > 0 ? `Min-spend of ₱ ${item.minamount.toLocaleString()}` : "No min-spend"}</p>
        <p className="text-xs text-center">Valid until {format(item.validuntil, "MMMM dd, yyyy")}</p>
      </div>
    </div>
  )
}