import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import CouponRenderer from "./components/coupon-renderer";
import CouponSlider from "./components/coupon-slider";

export default async function CouponsPage() {

  const session = await getServerSession(options)

  return (
    <div className="min-w-screen min-h-screen">
      <div className="w-full flex justify-center">
        <div className="w-[1000px]">
          <CouponSlider />
          <br />
          <CouponRenderer userid={session?.user?.id} />
        </div>
      </div>
    </div>
  )
}