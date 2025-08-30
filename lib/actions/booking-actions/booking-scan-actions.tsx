'use server'

import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import CompletedBookingEmail from "@/lib/email-templates/completed-booking-email"
import { mailOption, transporter } from "@/lib/nodemailer"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { balancerecord, legals } from "@/lib/zod/z-schema"
import { render } from "@react-email/render"
import axios from "axios"
import { add } from "date-fns"
import { headers } from "next/headers"
import { z } from "zod"
import { createUserLog } from "../account-actions/create-user-log"
import { getBaseUrl } from "@/lib/utils/get-baseurl"

const insertbalance = balancerecord.omit({
  id: true,
  bookingid: true,
})

const insertlegal = legals.omit({ id: true, refunded_on: true })

export const checkinBooking = async (
  bookingid: string,
  balances: z.infer<typeof insertbalance>[],
  legal: z.infer<typeof insertlegal> | null,
  headCount: {
    adult: number;
    senior: number;
    teens: number;
    celebrant: number;
  },
  isCottage: boolean,
) => {

  try {

    await prisma.$transaction(async (tx) => {
      let additionalquery = {}

      if (legal) {
        const res = await backendClient.publicImages.confirmUpload({
          url: legal.signature
        })

        if (!res.success) throw new Error()

        additionalquery = {
          legal: {
            create: legal
          }
        }
      }

      if (isCottage) {
        additionalquery = {
          ...additionalquery,
          adults: headCount.adult,
          seniorpwds: headCount.senior,
          teenkids: headCount.teens,
          celebrant: headCount.celebrant,
        }
      }

      await prisma.booking.update({
        where: {
          id: bookingid
        },
        data: {
          balance: {
            create: balances
          },
          status: "Ongoing",
          bookinglog: {
            create: [{
              status: "Check-in",
              log_at: new Date(),
            }]
          },
          ...additionalquery,
        }
      })

    })

    createUserLog("Proceeded to check-in.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Proceeding to checkin.", "POST", "Fatal", JSON.stringify({ bookingid, balances }), "/booking-scan-action")
    return { status: 500 }
  }
}

export const checkoutBooking = async (
  bookingid: string,
  packageid: string,
  balances: z.infer<typeof insertbalance>[],
  refundabledeposit: number,
  hasdeposit: boolean
) => {

  try {

    const baseurl = getBaseUrl()

    await prisma.$transaction(async (tx) => {
      let extraquery = {}

      if (hasdeposit) {
        extraquery = {
          legal: {
            update: {
              data: {
                refunded_on: new Date(),
                refunded_amount: refundabledeposit
              }
            }
          }
        }
      }

      const data = await tx.booking.update({
        where: {
          id: bookingid
        },
        data: {
          status: "Completed",
          balance: {
            create: balances
          },
          bookinglog: {
            create: [{
              status: "Check-out",
              log_at: new Date(),
            }]
          },
          ratinglinks: {
            create: {
              created_at: new Date(),
              packageid: packageid,
            }
          },
          ...extraquery
        },
        select: {
          checkin: true,
          packagedata: true,
          ratinglinks: true,
          bookingid: true,
          balance: true,
          client: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
            }
          },
          legal: true,
        }
      })

      // calculate the refundables
      const balance = data.balance.reduce((a, b) => a + b.total, 0)
      if (balance <= 0) { // the balance can only be 0 or negative number
        await tx.booking.update({
          where: {
            id: bookingid
          },
          data: {
            refund: {
              create: {
                refundableuntil: add(new Date, { days: 7 }),
                isvalid: true,
                refundables: Math.abs(balance),
              }
            }
          }
        })
      }

      // send an email containing the rating link
      if (data.ratinglinks) {
        const emaildata = {
          name: data.client.firstname,
          bookingid: data.bookingid,
          ratingkey: data.ratinglinks.id,
        }

        const emailHTML = render(<CompletedBookingEmail baseUrl={baseurl} {...emaildata} />)

        await transporter.sendMail({
          ...mailOption,
          to: data.client.email,
          subject: "Booking completed!",
          html: emailHTML,
        })
      }

    }, { maxWait: 60000, timeout: 60000 })

    createUserLog("Proceeded to check-out.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Proceeding to check-out.", "POST", "Fatal", JSON.stringify({ bookingid }), "/booking-scan-action")
    return { status: 500 }
  }
}