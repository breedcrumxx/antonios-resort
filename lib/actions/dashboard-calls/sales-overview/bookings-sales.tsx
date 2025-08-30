'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { bookingdata, bookingrecord, refunds } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import z from 'zod'
/**
 * 
 * @param filter - String months
 * @returns returns the total amount of pending bookings base on given filter.
 */
export const getPendingBookingsTotal = async (filter: FilterDateObject) => {

  try {

    const data = await prisma.booking.findMany({
      where: {
        status: {
          in: ['Pending', 'Ongoing', 'Approved']
        },
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      },
      select: {
        total: true,
      }
    })

    return { status: 200, data: data.reduce((a, b) => a + b.total, 0) }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting pending booking data.", "GET", "Minor", "", "/booking-sales")
    return { status: 500, data: 0 }
  }
}

/**
 * 
 * @param filter - String month
 * @returns returns the total valid refundables plus the extra data.
 */
export const getRefundables = async (filter: FilterDateObject) => {
  try {

    const bookings: z.infer<typeof bookingdata>[] = await prisma.booking.findMany({
      where: {
        NOT: {
          refund: null
        },
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        },
        status: {
          in: ['Completed', 'Rejected', 'Cancelled']
        }
      },
      select: {
        refund: true,
        status: true,
      }
    }) as unknown as z.infer<typeof bookingrecord>[]

    // get total of cancelled, completed, rejected,
    // get total of all,
    // get total of claimed
    // get total of unclaimed
    // get total of invalid/expired

    const totalofcancelled = bookings
      .filter((item) => item.status == "Cancelled")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)
    const totalofcompleted = bookings
      .filter((item) => item.status == "Completed")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)
    const totalofrejected = bookings
      .filter((item) => item.status == "Rejected")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const totalofall = totalofcancelled + totalofcompleted + totalofrejected

    const refunded = bookings
      .filter((item) => (item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const unclaimed = bookings
      .filter((item) => (item.refund as z.infer<typeof refunds>).isvalid && new Date((item.refund as z.infer<typeof refunds>).refundableuntil).getTime() >= new Date().getTime() && !(item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const invalid = bookings
      .filter((item) => !(item.refund as z.infer<typeof refunds>).isvalid)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const expired = bookings
      .filter((item) => (item.refund as z.infer<typeof refunds>).isvalid && new Date().getTime() > new Date((item.refund as z.infer<typeof refunds>).refundableuntil).getTime() && !(item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const totalofinvalid = invalid + expired

    return { status: 200, data: unclaimed, extra: { totalofcompleted, totalofcancelled, totalofrejected, totalofall, refunded, totalofinvalid } }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting sales data.", "GET", "Minor", "", "/booking-sales")
    return { status: 500, data: 0, extra: { totalofcompleted: 0, totalofcancelled: 0, totalofrejected: 0, totalofall: 0, refunded: 0, totalofinvalid: 0 } }
  }
}

export type RefundableExtraType = {
  totalofcompleted: number,
  totalofcancelled: number,
  totalofrejected: number,
  totalofall: number,
  refunded: number,
  totalofinvalid: number,
}

/**
 * 
 * @param filter - String month
 * @returns returns the total amount of completed bookings base on given filter
 */
export const getCompletedBookingsTotal = async (filter: FilterDateObject) => {

  try {

    const bookings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      },
      select: {
        total: true,
      }
    })

    // booking total
    // penalty
    // reschedule

    return { status: 200, data: bookings.reduce((a, b) => a + b.total, 0) }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting sales data.", "GET", "Minor", "", "/booking-sales")
    return { status: 500, data: 0 }
  }
}

/**
 * 
 * @param filter - String this month filter
 * @returns returns the total income for specific month, and extra info
 */
export const getTotalIncome = async (filter: FilterDateObject) => {
  try {

    const completedbookings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      },
      select: {
        total: true,
        balance: {
          where: {
            type: {
              not: "Payment balance"
            }
          }
        },
      }
    })

    const extrasofbookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: ["Completed", "Ongoing", "Pending", "Approved"],
        },
        checkout: {
          gte: filter.get.start,
          lte: filter.get.end,
        }
      },
      select: {
        total: true,
        balance: {
          where: {
            type: {
              not: "Payment balance"
            }
          }
        },
      }
    })

    const completedbookingtotal = completedbookings.reduce((a, b) => a + b.total, 0)
    const completedrechedules = completedbookings.map((item) => {
      return item.balance
        .filter((x) => x.type == "Reschedule" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedpenalties = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Penalty" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedentrancefees = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Entrance" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedbreakage = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Breakage" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)

    const redrechedules = extrasofbookings.map((item) => {
      return item.balance
        .filter((x) => x.type == "Reschedule" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const redpenalties = extrasofbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Penalty" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const redentrancefees = extrasofbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Entrance" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)

    const totalrechedules = completedrechedules + redrechedules
    const totalpenalties = completedpenalties + redpenalties
    const totalentrances = completedentrancefees + redentrancefees
    const totalincome = completedbookingtotal + totalrechedules + totalpenalties + totalentrances + completedbreakage


    console.log(completedpenalties, redpenalties)
    // total income
    // break down
    // penalties
    // reschdules
    // entrance fees

    return {
      status: 200, data: totalincome,
      extra: {
        totalofcompleted: completedbookingtotal,
        totalofreschedules: totalrechedules,
        totalpenalties: totalpenalties,
        totalentrances: totalentrances,
        totalbreakage: completedbreakage,
      }
    }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting sales data.", "GET", "Minor", "", "/booking-sales")
    return {
      status: 500, data: 0, extra: {
        totalofcompleted: 0,
        totalofreschedules: 0,
        totalpenalties: 0,
        totalentrances: 0,
        totalbreakage: 0,
      }
    }
  }
}

export type TotalIncomeExtraType = {
  totalofcompleted: number,
  totalofreschedules: number,
  totalpenalties: number,
  totalentrances: number,
  totalbreakage: number,
}

export const getBookingGrowth = async (filter: FilterDateObject) => {
  try {

    const expectedNow = await getTotalIncome(filter)
    const expectedBefore = await getTotalIncome({ ...filter, get: filter.compare, })

    if (expectedNow.status == 500 || expectedBefore.status == 500) return { status: 500, data: 0 }

    if (expectedBefore.data == 0 || expectedBefore.data == 0) return { status: 200, data: 0 }

    const nowrevenue = expectedNow.data + Object.values(expectedNow.extra).reduce((a: number, b: number) => a + b, 0)
    const beforerevenue = expectedBefore.data + Object.values(expectedBefore.extra).reduce((a: number, b: number) => a + b, 0)

    const diff = nowrevenue - beforerevenue
    const overdiff = diff / beforerevenue
    const growth = overdiff * 100

    return { status: 200, data: growth }
  } catch (error) {
    console.error(error)
    return { status: 500, data: 0 }
  }
}

