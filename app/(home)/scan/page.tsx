
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Result } from "antd";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import BookingIdInput from "./components/booking-id-input";
import Scanner from "./components/scanner";

export default async function ScanPage() {

  const session = await getServerSession(options)

  if (!session) {
    redirect(`/signin?callbackUrl=/scan`)
  }

  if (!(session.user as UserSession).role.utilityaccess) {
    return (
      <div className="min-w-screen min-h-screen">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={<Link href="/" className="py-2 px-4 bg-prm text-white font-semibold hover:text-white rounded-sm">Back Home</Link>}
        />
      </div>
    )
  }

  return (
    <div className="h-screen min-w-screen p-4">
      <h1 className="text-center font-semibold">Scan your bookings</h1>
      <br />
      <div className="w-full flex flex-col items-center">
        <div className="w-[50vh] max-w-[50vw]">
          <Scanner />
          <p className="my-4 text-sm font-semibold text-center">Or paste the booking ID</p>
          <BookingIdInput />
        </div>
        <br />
        <p className="text-sm text-gray-500 text-center max-w-[60vw]">Scan the QR code of the booking to view more details and log in. The QR code of the booking can be found on the profile page under &apos;View Details of Booking and can be downloaded..</p>
      </div>
    </div>
  )
}