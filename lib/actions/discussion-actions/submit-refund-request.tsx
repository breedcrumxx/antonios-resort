'use server'

import { mailOption, transporter } from '@/lib/nodemailer'
import prisma from '@/lib/prisma'
import { render } from '@react-email/render'
import z from 'zod'
import RefundRequestEmail from '../../email-templates/refund-request-email'
import { getBaseUrl } from '@/lib/utils/get-baseurl'

const refundformtype = z.object({
  accountnumber: z.string()
    .min(11, { message: "Please enter a valid number!" })
    .max(11, { message: "Invalid number!" }),
  accountname: z.string().min(3, { message: "Please enter a the account's full name!" })
})

export const submitRefundRequest = async (id: string, bookingid: string, data: z.infer<typeof refundformtype>, clientid: string, name: string, email: string) => {

  try {

    const response: string = await prisma.$transaction(async (tx) => {
      // create a refund record
      const bookingticket = await tx.discussion.create({
        data: {
          discussionid: `CT-D-${new Date().getTime()}`,
          recentactivity: new Date().getTime(),
          userid: clientid,
          bookingid: id,
          type: "Refund",
          date: new Date(),
          status: "Pending",
          chats: {
            create: [
              {
                date: new Date().getTime(),
                content: `I would like to request a refund for my booking with booking ID of ${bookingid}.`,
                sender: "Client",
                type: "message",
              },
              {
                date: new Date().getTime(),
                content:
                  `My GCash details:
                  Account number: ${data.accountnumber}
                  Account name: ${data.accountname}
                `,
                sender: "Client",
                type: "message",
              },
            ]
          }
        }
      })

      // create a system notification
      await tx.notification.create({
        data: {
          head: "Refund request",
          content: `A client requested a refund with a ticket ID of ${bookingticket.discussionid}.`,
          date: new Date(),
          type: "admin",
          extratype: "link",
          extra: `/admin/inbox/${bookingticket.discussionid}`,
          userid: clientid,
        }
      })

      const emailData = {
        name: name,
        bookingid: bookingid,
        refundrequestid: bookingticket.id,
      }

      const baseurl = getBaseUrl()

      const emailHTML = render(<RefundRequestEmail baseUrl={baseurl} {...emailData} />)

      // send an email to the user
      await transporter.sendMail({ ...mailOption, to: email, subject: "Refund request", html: emailHTML })

      return bookingticket.id as string
    })

    return { status: 200, data: response }

  } catch (error) {
    console.error(error)
    return { status: 500, data: "" }
  }
}