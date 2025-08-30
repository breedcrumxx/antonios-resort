'use server'

import prisma from "@/lib/prisma"

export const getUserInfo = async (userid: string) => {
  try {

    const response = await prisma.$transaction(async (tx) => {
      const userdata = await tx.user.findUnique({
        where: {
          id: userid
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
          _count: {
            select: {
              booking: true,
              mycoupons: {
                where: {
                  status: "active"
                }
              }
            },
          },
        }
      })

      if (!userdata) throw new Error()

      const bookings = await tx.booking.findMany({
        where: {
          clientid: userid,
          status: "Completed"
        },
        orderBy: {
          book_at: 'desc'
        },
        take: 5,
      })

      const completedbookingcount = await tx.booking.count({
        where: {
          clientid: userid,
          status: "Completed",
        }
      })

      return { ...userdata, completedbookings: bookings.map((item) => ({ ...item, package: JSON.parse(item.packagedata) })), totalcompleted: completedbookingcount }
    })

    // name, email, completed bookings, bookings made, pending bookings, custom packages
    return { status: 200, data: response }

  } catch (error) {
    console.error("Error at: get_user_info (action)", error)
    return { status: 500, data: null }
  }
}