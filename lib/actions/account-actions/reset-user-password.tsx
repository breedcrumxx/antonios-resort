'use server'
import { mailOption, transporter } from '@/lib/nodemailer';
import prisma from '@/lib/prisma';
import { systemLogger } from '@/lib/utils/api-debugger';
import { render } from '@react-email/render';
import { add } from 'date-fns';
import { headers } from 'next/headers';
import PasswordResetEmail from '../../email-templates/password-reset-email';
import { createUserLog } from './create-user-log';
import bcrypt from 'bcrypt'
import OTPEmail from '@/lib/email-templates/email-otp';

export const resetUserPassword = async (email: string, client?: boolean, userid?: string,) => {

  try {
    let id = userid

    if (!id) {
      const data = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true
        }
      })

      if (!data) return { status: 404 }

      id = data.id
    }

    const data = await prisma.resetpasswordlink.create({
      data: {
        validuntil: add(new Date(), { hours: 2 }),
        userid: id
      }
    })

    const emailHTML = render(<PasswordResetEmail
      client={client}
      resetid={data.id} />)

    await transporter.sendMail({ ...mailOption, to: email, subject: "Password reset link", html: emailHTML })

    createUserLog("Sent an email to reset account password.")
    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending an email to reset user's password", "POST", "Fatal", "", "/reset-user-password")
    return { status: 500 }
  }
}

export const sendUserResetOTP = async (email: string, otp: string) => {
  try {
    const emailHTML = render(<OTPEmail
      otp={otp} />)

    await transporter.sendMail({ ...mailOption, to: email, subject: "OTP", html: emailHTML })

    await createUserLog("Sent an email to reset account password.")
    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Sending an email to reset user's password", "POST", "Fatal", "", "/reset-user-password")
    return { status: 500 }
  }
}

export const changeAccountPassword = async (email: string, newpassword: string): Promise<{
  status: 200 | 404 | 409 | 500
}> => {
  try {

    const hashedpassword = await bcrypt.hash(newpassword, 10)

    const prevpass = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        password: true
      }
    })

    if (!prevpass) return { status: 404 } // account not found

    const isMatched = await bcrypt.compare(newpassword, prevpass.password)

    if (isMatched) return { status: 409 } // account password is the same

    await prisma.user.update({
      where: {
        email: email
      },
      data: {
        password: hashedpassword,
        userlogs: {
          create: [{
            ipaddress: headers().get("x-forwarded-for") as string,
            device: headers().get("sec-ch-ua-platform") as string,
            activity: "Changed account password.",
            weblocation: headers().get("referer") as string,
            logdate: new Date(),
          }]
        }
      }
    })

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Changing account password.", "POST", "Fatal", JSON.stringify({
      email,
      newpassword: await bcrypt.hash(newpassword, 10)
    }), "/reset-user-password")
    return { status: 500 }
  }
}