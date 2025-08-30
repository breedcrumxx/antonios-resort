import FailToApprovedEmail from "@/lib/email-templates/fail-to-approve";
import NoShowEmail from "@/lib/email-templates/no-show-email";
import { mailOption, transporter } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { getBaseUrl } from "@/lib/utils/get-baseurl";
import { bookingrecord } from "@/lib/zod/z-schema";
import { render, renderAsync } from "@react-email/render";
import { add } from "date-fns";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {

  try {

    const baseurl = getBaseUrl()

    const data = await prisma.booking.findMany({
      where: {
        status: {
          in: ['Pending', 'Approved']
        },
        checkin: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: add(new Date(), { days: 2 }),
        }
      },
      select: {
        id: true,
        checkin: true,
        checkout: true,
        status: true,
        packagedata: true,
        total: true,
        transaction: {
          select: {
            expectedpayment: true,
          }
        }
      }
    })

    const transformedData = data.map((item) => ({ ...item, package: JSON.parse(item.packagedata) })) as unknown as z.infer<typeof bookingrecord>[]

    // toggle no-show on approved bookings with 2 hours late
    const noshows = transformedData
      .filter((item) => item.status == "Approved" && item.package.type != "event")
      .filter((item) => add(new Date(item.checkin), { hours: 2 }).getTime() < new Date().getTime())

    // get the cancellables
    const cancellables = transformedData
      .filter((item) => item.status == "Pending")
      .filter((item) => add(item.checkin, { days: 1 }).getTime() >= new Date().getTime()) // cancel all the booking that the admin forgot to approve

    await prisma.$transaction(async (tx) => {

      const noshowquery = noshows.map(async (item) => {
        return await tx.booking.update({
          where: {
            id: item.id
          },
          data: {
            status: 'No-show',
            refund: {
              create: {
                refundableuntil: add(new Date(), { days: 7 }),
                isvalid: false,
                refundables: item.transaction.expectedpayment,
              }
            }
          }
        })
      })

      const cancellablequery = cancellables.map(async (item) => {
        return await tx.booking.update({
          where: {
            id: item.id
          },
          data: {
            status: "Cancelled",
            refund: {
              create: {
                refundableuntil: add(new Date(), { days: 7 }),
                isvalid: true,
                refundables: item.transaction.expectedpayment,
              }
            },
            rejectionandcancellation: {
              create: {
                reason: "Admin's unable to approve on time.",
                type: "Rejected",
                created_at: new Date(),
              }
            }
          }
        })
      })

      // send an email to these bookings
      await Promise.all(noshowquery)
      await Promise.all(cancellablequery)

      if (noshows.length > 0) {
        const noShowEmail = await renderAsync(<NoShowEmail baseUrl={baseurl} />)
        const noShowEmails = noshows.map((item) => item.client.email)
        await transporter.sendMail({ ...mailOption, to: noShowEmails, subject: "No-show", html: noShowEmail })
      }

      if (cancellables.length > 0) {
        const cancelledEmail = await renderAsync(<FailToApprovedEmail baseUrl={baseurl} />)
        const cancelledEmails = cancellables.map((item) => item.client.email)

        await transporter.sendMail({ ...mailOption, to: cancelledEmails, subject: "Cancelled", html: cancelledEmail })
      }
    })

    return NextResponse.json({ status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Running auto reject.", "GET", "Fatal", "", "/check")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}