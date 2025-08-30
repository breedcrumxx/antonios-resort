import { options } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import CouponFetcher from "./components/coupon-fetcher"

export default async function MyCouponsPage() {

  const session = await getServerSession(options)

  if (!session) {
    redirect("/signin?callbackUrl=/profile/mycoupons")
    return
  }

  return (
    <CouponFetcher userid={(session.user as UserSession).id} />
  )
}