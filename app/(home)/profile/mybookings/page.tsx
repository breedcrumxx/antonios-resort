import { getServerSession } from "next-auth";
import TableTop from "./components/user-booking-table";
import { redirect } from "next/navigation";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ZoomerContextProvider from "@/app/admin/(admin)/(dashboard)/bookings/booking-components/zoomer-provider";

export default async function MyBookingsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/profile")

  return (
    <div className="min-h-screen w-full px-4">
      <ZoomerContextProvider>
        <TableTop user={session.user as UserSession} />
      </ZoomerContextProvider>
    </div>
  )
}