'use server'

import { headers } from "next/headers"
import { mailOption, transporter } from "../nodemailer"
import { systemLogger } from "./api-debugger"

export const emailSender = async (email: string, subject: string, html: any) => {
  try {

    await transporter.sendMail({
      ...mailOption,
      to: email,
      subject: subject,
      html: html
    })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending an email.", "SMTP", "Fatal", JSON.stringify({ email, subject, html }), "/email-sender")
  }
}