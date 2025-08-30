import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { AccountLoginFormSchema } from "@/lib/zod/z-schema";
import bcrypt from 'bcrypt';
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from 'zod';

export async function POST(req: Request) {

  const ResetForm = z.object({
    confirm: z.string()
  }).merge(AccountLoginFormSchema)

  const data = await req.json()
  const userip = req.headers.get("x-forwarded-for") || "Unknown"
  const device = req.headers.get("sec-ch-ua-platform") || "Unknown"

  try {

    const isValid = ResetForm.safeParse(data)

    if (!isValid.success) {
      await systemLogger(isValid.error, Object.fromEntries(headers()), "Attempting to reset account password.", "POST", "Minor", JSON.stringify(data), "/reset")
      return NextResponse.json({ message: "Bad request" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          email: data.email
        },
        data: {
          password: hashedPassword,
          userlogs: {
            create: [{
              ipaddress: userip,
              device: device,
              activity: "User changed account password.",
              weblocation: req.headers.get("referer") as string,
              logdate: new Date(),
            }]
          }
        },
      })
    })

    return NextResponse.json({ status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Resetting account password.", "POST", "Fatal", JSON.stringify({ data }), "/reset")
    return NextResponse.json({ message: "Internal Server Error!" }, { status: 500 })
  }
}