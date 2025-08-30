'use server'

import prisma from "@/lib/prisma"
import { render } from "@react-email/render"
import CancelledBookingEmail from "../../email-templates/user-cancelled-booking"
import { mailOption, transporter } from "@/lib/nodemailer"
import { add } from "date-fns"
import { refunds } from "@/lib/zod/z-schema"
import z from 'zod'
import { getServerSession } from "next-auth"
import { options } from "@/app/api/auth/[...nextauth]/options"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import { createUserLog } from "../account-actions/create-user-log"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

function isRefundable(bookingStartDate: Date): boolean {
  const currentTime = new Date();
  const timeDifference = bookingStartDate.getTime() - currentTime.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

  return hoursDifference >= 24;
}

export const cancelBooking = async (bookingid: string, reason: string, adminRequest?: boolean | undefined) => {

  try {

    const baseurl = getBaseUrl()

    const session = await getServerSession(options)

    // wrap in transaction
    const response = await prisma.$transaction(async (tx) => {

      const booking = await tx.booking.findUnique({
        where: {
          id: bookingid
        },
        select: {
          checkin: true,
          status: true,
          client: true,
          bookingid: true,
          transaction: true,
        }
      })

      if (!booking) { // if booking went missing, throw an error
        return { status: 200, data: null }
      }

      if (booking.status == "Cancelled") { // check if the booking already cancelled
        return { status: 200, data: null }
      }

      // calculate the refundable and create a refunds records
      const refundable = isRefundable(booking.checkin)

      const refunddata = await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          status: "Cancelled",
          refund: {
            create: {
              refundableuntil: add(new Date(), { days: 7 }),
              isvalid: refundable,
              refundables: booking.transaction?.expectedpayment as number,
            }
          }
        },
        select: {
          refund: true
        }
      })

      // create a rejectionandcancellation record
      await tx.rejectionandcancellation.create({
        data: {
          bookingid: bookingid,
          reason: reason,
          type: "Cancelled",
          created_at: new Date(),
        }
      })

      // create a on system notification
      let notification = ""

      if (adminRequest) {
        notification = `You cancelled a booking with booking ID of ${booking.bookingid}`
      } else {
        notification = `${booking.client.firstname + " " + booking.client.lastname} just cancelled their booking.`
      }

      // create a system notification record
      await tx.notification.create({
        data: {
          head: "A booking has been cancelled",
          content: notification,
          type: "admin",
          date: new Date(),
          userid: session?.user?.id,
          extra: bookingid,
          extratype: "bookingid",
        }
      })

      const emailData = {
        name: booking.client.firstname,
        bookingid: booking.bookingid,
        reason: reason
      }

      // send an cancelled email to the user
      const emailHTML = render(<CancelledBookingEmail baseUrl={baseurl} {...emailData} />)
      await transporter.sendMail({ ...mailOption, to: booking.client.email, subject: "Booking cancelled", html: emailHTML })

      createUserLog("User cancelled a booking.")
      return { status: 200, data: refunddata.refund as z.infer<typeof refunds> }
    })

    return { status: response.status, data: response.data }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), 'Cancelling a booking.', 'POST', "Fatal", JSON.stringify({ bookingid, reason, adminRequest }), '/cancel-booking')
    return { status: 500, data: null }
  }
}