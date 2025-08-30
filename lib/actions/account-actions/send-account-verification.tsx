'use server'

import { systemLogger } from "@/lib/utils/api-debugger"
import { render } from "@react-email/render"
import { headers } from "next/headers"
import VerifyAccountEmail from "../../email-templates/verify-account-email"
import prisma from "@/lib/prisma"
import { mailOption, transporter } from "@/lib/nodemailer"
import { getBaseUrl } from "@/lib/utils/get-baseurl"

export const verifyAccountEmail = async (email: string) => {
  try {

    const baseurl = getBaseUrl()

    const data = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        id: true,
      }
    })

    if (data) {
      const emailHTML = render(
        <VerifyAccountEmail baseUrl={baseurl} verificationId={btoa(data.id)} />
      )

      await transporter.sendMail({ ...mailOption, to: email, subject: "Verifying Account", html: emailHTML })
    }


    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Resending email verification.", "POST", "Fatal", "", "/verify-account-email")
    return { status: 500 }
  }
}