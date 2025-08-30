'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getStartAndEndDate, months } from "@/lib/utils/month-filter-utils"
import { headers } from "next/headers"

/**
 * Generates a random integer between min and max (inclusive).
 * @param value1 - Number value to get the growth from prevvalue.
 * @param value2 - Number value to differentiate the current value.
 * @returns returns floating number represents the percentage growth of the value1 over value2.
 */
export async function getIncomeGrowth(value1: number, value2: number) {
  return ((value1 - value2) / value2) * 100
}

/**
 * 
 * @returns `{bookings: number, pending: number, ongoing: number}`
 */
export const getDashboardWindowData = async (): Promise<{
  status: 200;
  data: {
    bookings: number;
    pending: number;
    ongoing: number;
  };
} | {
  status: 500;
}> => {
  try {

    const { startDate: thisMonthStart, endDate: thisMonthEnd } = getStartAndEndDate(months[new Date().getMonth()])

    const bookingsreceived = await prisma.booking.count({
      where: {
        book_at: {
          gte: thisMonthStart,
          lte: thisMonthEnd,
        }
      }
    })

    const pending = await prisma.booking.count({
      where: {
        status: 'Pending',
      }
    })

    const ongoing = await prisma.booking.count({
      where: {
        status: 'Ongoing',
      }
    })

    return { status: 200, data: { bookings: bookingsreceived, pending: pending, ongoing: ongoing } }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting dashboard window data.", "GET", "Minor", "", "/dashboard-stats")
    return { status: 500 }
  }
}

/**
 * 
 * @param filter - default
 * @returns returns the data count of users total, this month, prev month, and the growth
 */
export const getTotalUsers = async (filter: string) => {
  try {
    const { startDate: thisMonthStart, endDate: thisMonthEnd } = getStartAndEndDate(filter)
    const { startDate: prevMonthStart, endDate: prevMonthEnd } = getStartAndEndDate(filter)

    const data = await prisma.user.findMany()

    const totalusers = data.length
    const totalusersthismonth = data.filter((item) => new Date(item.datecreated).getTime() >= thisMonthStart.getTime() && new Date(item.datecreated).getTime() <= thisMonthEnd.getTime()).length
    const prevtotalusers = data.filter((item) => new Date(item.datecreated).getTime() >= prevMonthStart.getTime() && new Date(item.datecreated).getTime() <= prevMonthEnd.getTime()).length
    const usergrowth = await getIncomeGrowth(totalusersthismonth, prevtotalusers)

    return { status: 200, data: totalusers, extra: { usersthismonth: totalusersthismonth, growth: usergrowth } }

  } catch (error) {
    console.error(error)
    return { status: 500, data: null }
  }
}

export type TotalUsersExtraType = {
  usersthismonth: number,
  growth: number,
}

export const getNewUsers = async (filter: string) => {
  try {
    const { startDate: thisMonthStart, endDate: thisMonthEnd } = getStartAndEndDate(filter)
    const { startDate: prevMonthStart, endDate: prevMonthEnd } = getStartAndEndDate(filter)

    const data = await prisma.user.findMany()

    const totalusersthismonth = data.filter((item) => new Date(item.datecreated).getTime() >= thisMonthStart.getTime() && new Date(item.datecreated).getTime() <= thisMonthEnd.getTime()).length
    const prevtotalusers = data.filter((item) => new Date(item.datecreated).getTime() >= prevMonthStart.getTime() && new Date(item.datecreated).getTime() <= prevMonthEnd.getTime()).length
    const usergrowth = await getIncomeGrowth(totalusersthismonth, prevtotalusers)

    return { status: 200, data: totalusersthismonth, extra: { usersthismonth: totalusersthismonth, growth: usergrowth } }

  } catch (error) {
    console.error(error)
    return { status: 500, data: null }
  }
}