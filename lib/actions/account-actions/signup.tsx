"use server"

import bcrypt from 'bcrypt'
import * as z from 'zod'

import { systemLogger } from '@/lib/utils/api-debugger'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import prisma from '../../prisma'
import { AccountFormSchema } from '../../zod/z-schema'
import { verifyAccountEmail } from './send-account-verification'

export const signup = async (values: z.infer<typeof AccountFormSchema>) => {
  const validatedFields = AccountFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return { status: 422 }
  }

  const { email, firstname, lastname, password } = validatedFields.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const validEmails = ['gmail.com', 'outlook.com', 'yahoo.com']

  const emailSubstring = email.split('@')[1]

  if (!validEmails.includes(emailSubstring)) {
    return { status: 422 } // invalid
  }

  try {

    await prisma.role.update({
      where: {
        role: "Client"
      },
      data: {
        user: {
          create: {
            email,
            firstname,
            lastname,
            password: hashedPassword,
            datecreated: new Date(),
            image: "",
            lastacceptedprivacy: new Date(),
            lastacceptedtermscondition: new Date(),
          },
        }
      }
    })

    await verifyAccountEmail(values.email)

    return { status: 201 }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { status: 409, data: "Email already exist!" }
      }
    }

    await systemLogger(error, Object.fromEntries(headers()), "Creating account.", "PUT", "Fatal", "", "/signup")
    return { status: 500 }
  }

}