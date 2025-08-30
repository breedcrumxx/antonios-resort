
'use server'

import { systemLogger } from "@/lib/utils/api-debugger"
import { coupons, extendedcoupons } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { z } from "zod"
import { createUserLog } from "../account-actions/create-user-log"
import prisma from "@/lib/prisma"
import crypto from 'crypto';
import { options } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"

export const deployCoupon = async (values: z.infer<typeof coupons>) => {
  try {
    let couponcode = ""

    const collection = await prisma.coupon.findMany({
      select: {
        couponcode: true
      }
    })

    while (true) {
      couponcode = await generateCouponCode()

      if (!collection.some((item) => item.couponcode == couponcode)) {
        break
      }
    }

    await prisma.coupon.create({
      data: {
        couponcode: couponcode,
        couponname: values.couponname,
        coupondescription: values.coupondescription,
        create_at: values.create_at,
        validuntil: values.validuntil,
        type: values.type,
        max: values.max,
        amount: values.amount,
        minamount: values.minamount,
        percent: values.percent,
        applicableto: values.applicableto
      }
    })

    createUserLog("Deployed a new coupon.")
    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Deploying a new coupon!", "PUT", "Moderate", JSON.stringify({ values }), "/coupon-actions")
    return { status: 500 }
  }
}

export const updateCoupon = async (values: z.infer<typeof extendedcoupons>) => {
  try {

    await prisma.coupon.update({
      where: {
        id: values.id
      },
      data: {
        couponname: values.couponname,
        coupondescription: values.coupondescription,
        type: values.type,
        max: values.max
      }
    })

    createUserLog("Updated coupon details.")
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating coupon details.", "POST", "Moderate", JSON.stringify({ values }), "/coupon-action")
    return { status: 500 }
  }
}

export const updateCouponStatus = async (couponid: string, status: string) => {
  try {
    await prisma.coupon.update({
      where: {
        id: couponid
      },
      data: {
        status: status
      }
    })

    createUserLog(`${status} a coupon.`)
    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `${status == "Disabled" ? "Disabling" : "Deleting"} a coupon.`, "POST", "Moderate", JSON.stringify({ couponid }), "/coupon-action")
    return { status: 500 }
  }
}

export const grabThisCoupon = async (couponid: string, userid: string): Promise<{
  status: 200 | 403 | 404 | 500;
}> => {

  try {

    // check if this coupons reached the max slot
    const data = await prisma.coupon.findUnique({
      where: {
        id: couponid
      },
      select: {
        userids: true,
        max: true,
      }
    })

    if (!data) return { status: 404 }

    if (data.userids.length >= data.max) {
      return { status: 403 }
    }

    await prisma.coupon.update({
      where: {
        id: couponid
      },
      data: {
        user: {
          connect: {
            id: userid
          }
        }
      }
    })

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Grabbing coupon.`, "POST", "Moderate", JSON.stringify({ couponid, userid }), "/coupon-action")
    return { status: 500 }
  }
}

export const grabThisCouponcode = async (couponcode: string) => {

  const session = await getServerSession(options)

  if (!session) return { status: 401 }

  try {

    const data = await prisma.coupon.update({
      where: {
        couponcode: couponcode
      },
      data: {
        user: {
          connect: {
            id: (session.user as UserSession).id
          }
        }
      }
    })

    if (!data) return { status: 404 }

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Grabbing coupon.`, "POST", "Moderate", JSON.stringify({ couponcode }), "/coupon-action")
    return { status: 500 }
  }
}

export const generateCouponCode = async (length = 8) => {
  // Define the character set to avoid confusion
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let couponCode = '';

  // Generate a secure random string
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
}

export const getMyCoupons = async (type: string, search?: string): Promise<{
  status: 500;
} | {
  status: 401;
} | {
  status: 404;
} | {
  status: 200;
  data: z.infer<typeof extendedcoupons>[];
}> => {

  const session = await getServerSession(options)

  if (!session) return { status: 401 }

  try {

    // if no search value, only return the accounts coupons
    if (!search) {
      const data = await prisma.user.findUnique({
        where: {
          id: (session.user as UserSession).id,
        },
        select: {
          mycoupons: {
            where: {
              applicableto: type,
              status: {
                notIn: ['Deleted', 'Disabled']
              },
              validuntil: {
                gt: new Date()
              },
            },
            include: {
              bookings: {
                where: {
                  clientid: (session.user as UserSession).id,
                },
                select: {
                  clientid: true,
                }
              },
            }
          }
        }
      })

      if (!data) return { status: 404 }

      return { status: 200, data: data.mycoupons as z.infer<typeof extendedcoupons>[] }
    }
    // if there's search value, try search for global coupon

    const response = await prisma.coupon.findMany({
      where: {
        applicableto: type,
        couponcode: {
          startsWith: search,
          mode: 'insensitive'
        },
      },
      include: {
        bookings: {
          where: {
            clientid: (session.user as UserSession).id
          },
          select: {
            id: true
          }
        }
      }
    })

    return { status: 200, data: response as z.infer<typeof extendedcoupons>[] }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Requesting my coupons.`, "GET", "Moderate", "", "/coupon-action")
    return { status: 500 }
  }
}