'use server'

import ConcernEmail from "@/lib/email-templates/concern-email"
import { mailOption, transporter } from "@/lib/nodemailer"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import { concernform } from "@/lib/zod/z-schema"
import { render } from "@react-email/render"
import { headers } from "next/headers"
import { z } from "zod"

export const sendConcern = async (values: z.infer<typeof concernform>) => {
  try {
    const emailData = {
      ...values,
      baseUrl: getBaseUrl()
    }

    const emailHTML = render(<ConcernEmail {...emailData} />)

    await transporter.sendMail({ ...mailOption, to: process.env.EMAIL_RELAY, subject: values.subject, html: emailHTML })

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending a concern.", "POST", "Fatal", JSON.stringify({ values }), "/send-concern")
    return { status: 500 }
  }
}