'use server'

import { mailOption, transporter } from "@/lib/nodemailer"
import prisma from "@/lib/prisma"
import { render } from "@react-email/render"
import RejectedBookingEmail from "../../email-templates/rejected-booking-email"
import { add } from "date-fns"
import { createUserLog } from "../account-actions/create-user-log"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/utils/get-baseurl"

export const rejectBooking = async (bookingid: string, rejectionReason: { name: string, value: string }) => {

  try {

    const baseurl = getBaseUrl()

    // wrap this operation with transaction 
    const response = await prisma.$transaction(async (tx) => {

      // check the booking first
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

      if (!booking) {
        return 404
      }

      if (booking.status == "Rejected") {
        return 200
      }

      // update the status of booking to rejected
      await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          status: "Rejected",
          refund: {
            create: {
              refundableuntil: add(new Date(), { days: 7 }),
              isvalid: true,
              refundables: booking.transaction?.expectedpayment as number,
            }
          }
        },
        select: {
          client: {
            select: {
              firstname: true,
              email: true,
            }
          },
          bookingid: true
        }
      })

      // create a record in rejectionandcancellationtable
      await tx.rejectionandcancellation.create({
        data: {
          bookingid: bookingid,
          reason: rejectionReason.name + ":" + rejectionReason.value,
          type: "Rejected",
          created_at: new Date()
        }
      })

      const emailProps = {
        name: booking.client.firstname,
        bookingid: booking.bookingid,
        generalreason: rejectionReason.name,
        reason: rejectionReason.value
      }

      // send the email here, prevent the cancellation without making sure that the email has been sent
      const emailHTML = render(<RejectedBookingEmail baseUrl={baseurl} {...emailProps} />)
      await transporter.sendMail({ ...mailOption, to: booking.client.email, subject: 'Rejected booking', html: emailHTML })

      return 200
    }, { maxWait: 60000, timeout: 60000 })

    createUserLog("Rejected a booking.")

    return { status: response }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Rejecting a booking.", "POST", "Moderate", JSON.stringify({ bookingid, rejectionReason }), "/reject-booking")
    return { status: 500 }
  }
}