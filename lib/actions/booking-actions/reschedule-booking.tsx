'use server'

import { mailOption, transporter } from "@/lib/nodemailer"
import prisma from "@/lib/prisma"
import { render } from "@react-email/render"
import RescheduledBookingEmail from "../../email-templates/reschedule-booking-email"
import { conciseDate } from "@/lib/utils/concise-date"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import { createUserLog } from "../account-actions/create-user-log"

export const rescheduleBooking = async (bookingid: string, newdatein: Date, newdateout: Date, reschedulefee: number, coverTheFees: boolean, couponids: string[], reason: string) => {
  try {

    await prisma.$transaction(async (tx) => {
      // try to update the booking date first
      const booking = await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          checkin: newdatein,
          checkout: newdateout,
          appliedcoupons: {
            connect: couponids.map((item) => ({ id: item }))
          }
        },
        select: {
          id: true,
          client: true,
          bookingid: true,
        }
      })

      const balances = [{
        bookingid: booking.id,
        record: `Rescheduled the booking to ${conciseDate(newdatein)} - ${conciseDate(newdateout)}`,
        type: "Reschedule",
        total: reschedulefee
      }]

      if (coverTheFees) {
        balances.push({
          bookingid: booking.id,
          record: `Covered the rescheduling fee of ${reschedulefee.toLocaleString()}`,
          type: "Reschedule payment",
          total: parseFloat("-" + reschedulefee)
        })
      }

      // then create the balance record
      await tx.balancerecord.createMany({
        data: balances
      })

      // send an email to the guest
      const emailData = {
        name: booking.client.firstname,
        bookingid: booking.bookingid,
        newdatein: newdatein,
        newdateout: newdateout,
        reschedulefee: reschedulefee,
        coverTheFees: coverTheFees,
        reason: reason
      }

      const baseurl = getBaseUrl()

      const emailHTML = render(<RescheduledBookingEmail baseUrl={baseurl} {...emailData} />)

      await transporter.sendMail({ ...mailOption, to: booking.client.email, subject: "Booking rescheduled", html: emailHTML })
    })

    createUserLog('Rescheduled a booking.')

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Rescheduling the booking.", "POST", "Fatal", "", "/reschedule-booking")
    return { status: 500 }
  }
}