'use server'

import CompletedBookingEmail from "@/lib/email-templates/completed-booking-email"
import { mailOption, transporter } from "@/lib/nodemailer"
import prisma from "@/lib/prisma"
import { render } from "@react-email/render"
// import { backendClient } from "../api/edgestore/[...edgestore]/route"

export const testEmail = async () => {

  const emailData = {
    name: "Dan",
    bookingid: "34856934589345",
    ratinglink: `${process.env.APP_DOMAIN}/rate/${548029490324}`,
    baseUrl: `${process.env.APP_DOMAIN}`
  }

  const emailHTML = render(<CompletedBookingEmail {...emailData} />)

  try {
    await transporter.sendMail({
      ...mailOption,
      to: "danrosete890@gmail.com",
      subject: "Test",
      html: emailHTML
    })
  } catch (error) {
    console.error(error)
  }
}

export const cleanTransactions = async () => {
  // try {


  //   const data = await prisma.transaction.findMany({})

  //   const responses = await Promise.all(data.map(async (item) => {
  //     try {
  //       await backendClient.publicFiles.deleteFile({
  //         url: item.referenceimage,
  //       });

  //       return { id: item.id, ok: true }
  //     } catch (error) {
  //       return { id: item.id, ok: false }
  //     }
  //   }))

  //   await prisma.transaction.deleteMany({
  //     where: {
  //       id: {
  //         in: responses.filter((item) => item.ok).map((item) => item.id)
  //       }
  //     }
  //   })

  //   console.log("Done!")

  //   return { status: 200 }

  // } catch (error) {
  //   console.error(error)
  //   return { status: 500 }
  // }
}