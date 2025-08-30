'use server'

import { mailOption, transporter } from "@/lib/nodemailer"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { render } from "@react-email/render"
import bcrypt from 'bcrypt'
import { headers } from "next/headers"
import VerifyEmail from "../../email-templates/verify-email"
import { createUserLog } from "./create-user-log"

export const checkEmailExistense = async (email: string, otp: string) => {
  try {

    const data = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (!data) {
      const emailHTML = render(<VerifyEmail verificationCode={otp} />)

      transporter.sendMail({ ...mailOption, to: email, subject: "Change email", html: emailHTML })
      return { status: 200, data: false }
    }

    return { status: 200, data: true }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Checking email existence", "POST", "Moderate", JSON.stringify({ email }), "/account-actions/check-email-existence")
    return { status: 500 }
  }
}

export const authenticateUser = async (email: string, password: string): Promise<{
  status: 200 | 401 | 404 | 500;
}> => {
  try {

    const data = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (!data) return { status: 404 }

    const passwordMatched = await bcrypt.compare(password, data.password)

    if (!passwordMatched) {
      createUserLog("Failed to authenticate.")
      return { status: 401 }
    }

    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Authenticating user", "POST", "Fatal", JSON.stringify({ email }), "/account-actions/check-email-existence")
    return { status: 500 }
  }
}