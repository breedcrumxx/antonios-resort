import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { defaultReschedulingPolicy, defaultReservationConfig, devconfig } from '@/lib/configs/config-file'
import { verifyConfig } from '@/lib/configs/verify-config'
import prisma from "@/lib/prisma"
import { systemLogger } from '@/lib/utils/api-debugger'
import { ErrorFeedback } from '@/lib/utils/error-report-modal'
import { bookingrecord, packageoffer } from '@/lib/zod/z-schema'
import { Result } from 'antd'
import { format } from "date-fns"
import { headers } from 'next/headers'
import { redirect } from "next/navigation"
import z from 'zod'
import Retractable from '../../package/(view)/[id]/view-components/retractable'
import DatePicker from './components/date-picker'
import { getServerSession } from "next-auth"
import { options } from "@/app/api/auth/[...nextauth]/options"

const forbidden = [
  'Rejected',
  'Cancelled',
  'Completed',
]

export default async function RebookingPage(context: { params: { id: string } }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect(`/signin?callbackUrl=/reschedule/${context.params.id}`)
  }

  const user = session.user as UserSession

  try {
    const data = await prisma.booking.findUnique({
      where: {
        id: context.params.id,
      },
      include: {
        packages: {
          select: {
            quantity: true,
          }
        },
      }
    })

    if (!data) throw new Error("/404")

    if (user.id != data.clientid && !user.role.businesscontrol) {
      throw new Error("/403")
    }

    const configs = await prisma.system.findMany({
      where: {
        name: {
          in: ["reschedulingpolicy", 'devs', 'reservationconfig']
        }
      }
    })

    const dataReschedule = configs.find((item) => item.name == "reschedulingpolicy") || null
    const dataReservation = configs.find((item) => item.name == "reservationconfig") || null
    const dataDevs = configs.find((item) => item.name == "devs") || null

    const rescheduleConf = await verifyConfig(dataReschedule, "reschedulingpolicy", defaultReschedulingPolicy)
    const reservationConf = await verifyConfig(dataReservation, "reservationConf", defaultReservationConfig)
    const devsconf = await verifyConfig(dataDevs, "devs", devconfig)

    const currentDate = new Date();
    const checkInDate = new Date(data.checkin);

    // Subtract 48 hours (2 days) from the check-in date
    const rescheduleDeadline = new Date(checkInDate);
    rescheduleDeadline.setDate(rescheduleDeadline.getDate() - 2);

    if (currentDate >= rescheduleDeadline && !(devsconf.DEBUG && devsconf.reschedule.allow) && !user.role.businesscontrol) throw new Error("Not Allowed!")
    if (forbidden.some((item) => item == data.status)) throw new Error("/403")

    const booking = { ...data, package: JSON.parse(data.packagedata) } as unknown as z.infer<typeof bookingrecord>

    return (
      <div className="min-w-screen min-h-screen py-10 px-4 sm:px-32">
        <h1 className="font-semibold text-xl">Reschedule your booking</h1>
        <br />
        <div className="w-full flex gap-2">
          <div className="w-full sm:w-2/3">
            <div className="space-y-2">
              <h1 className="font-semibold">Package details</h1>
              <div className='grid grid-cols-2 text-sm'>
                <Label>Package name</Label>
                <p>{booking.package.packagename}</p>
              </div>
              <div className='grid grid-cols-2 text-sm'>
                <Label>Sets</Label>
                <p> x {data.quantity}</p>
              </div>
            </div>

            <br />

            <div className="space-y-2">
              <h1 className="font-semibold">Booking details</h1>
              <div className='grid grid-cols-2 text-sm'>
                <Label>Check-in</Label>
                <p>{format(data.checkin, "MMMM do yyyy, h:mm a")}</p>
              </div>
              <div className='grid grid-cols-2 text-sm'>
                <Label>Check-out</Label>
                <p> {format(data.checkout, "MMMM do yyyy, h:mm a")}</p>
              </div>
              {
                data.slot == "night" && (
                  <div className='grid grid-cols-2 text-sm'>
                    <Label>Night/s</Label>
                    <p> x {data.days}</p>
                  </div>
                )
              }
            </div>

            <Separator className="my-4" />

            <div>
              <h1 className="font-semibold">Reschedule this booking</h1>
              <br />
              <DatePicker
                booking={booking}
                reservationConfig={reservationConf}
                quantity={(data.packages as z.infer<typeof packageoffer>).quantity}
                isAdmin={(session.user as UserSession).role.websitecontrol}
              />
            </div>
          </div>

        </div>
        <Separator className="my-4" />
        <Retractable>
          <div dangerouslySetInnerHTML={{ __html: rescheduleConf }}></div>
        </Retractable>
      </div>
    )

  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "/404") {
        redirect(error.message)
      }

      if (error.message == "/403") {
        return (
          <div className="min-w-screen min-h-screen py-10 px-32">
            <Result
              status="403"
              title="Not Allowed!"
              subTitle="You are currently not allowed to access this page!"
              extra={<>
                <p className="">This booking is not allowed for rescheduling for the following possible reasons:</p>
                <br />
                <ul className="list-disc px-10 text-sm text-left">
                  <li>This booking was not made on this account.</li>
                  <li>Your booking was rejected.</li>
                  <li>Your booking was cancelled.</li>
                  <li>Your booking was already completed.</li>
                  <li>Your booking had pass the rescheduling threshold of up to 48 hours before your original check-in date.</li>
                </ul>
              </>}
            />
          </div>
        )
      }
    }

    await systemLogger(error, Object.fromEntries(headers()), "Accessing addmore page.", "GET", "Moderate", "", "/addmore/avail")
    return (
      <div className="min-w-screen min-h-screen py-10 px-32">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0007"
          fatal
        />
      </div>
    )
  }
}