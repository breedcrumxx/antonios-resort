'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { months } from "@/lib/utils/month-filter-utils"
import { headers } from "next/headers"

export const getUserEngagementData = async (year: number) => {
  try {

    // get the all months' start and end date of the selected year
    let selectedmonths = months.map((item, i) => {
      return { id: i, start: new Date(year, i, 1), end: new Date(new Date(year, i + 1, 0).setHours(23, 59, 59)) }
    }).sort((a, b) => a.id - b.id)

    const threeMonthsAgooffirstdate = new Date(selectedmonths[0].start)
    threeMonthsAgooffirstdate.setMonth(threeMonthsAgooffirstdate.getMonth() - 2)

    const monthlyactive = await prisma.user.findMany({
      where: {
        userlogs: {
          some: {
            logdate: {
              gte: threeMonthsAgooffirstdate,
              lte: selectedmonths[selectedmonths.length - 1].end
            },
          },
        }
      },
      select: {
        userlogs: {
          select: {
            logdate: true,
          },
          take: 1,
          where: {
            logdate: {
              gte: threeMonthsAgooffirstdate,
              lte: selectedmonths[selectedmonths.length - 1].end
            }
          },
        }
      }
    })

    // processed montly active
    const processactiveusers = selectedmonths.map((item) => {
      const threeMonthsAgo = new Date(item.start)
      threeMonthsAgo.setMonth(item.start.getMonth() - 2)

      return monthlyactive.filter((iter) => {
        return new Date(iter.userlogs[0].logdate).getTime() >= threeMonthsAgo.getTime() && new Date(iter.userlogs[0].logdate).getTime() <= new Date(item.end).getTime()
      }).length
    })

    const montlyinactive = await Promise.all(selectedmonths.map(async (item, i) => {
      const threeMonthsAgo = new Date(item.start)
      threeMonthsAgo.setMonth(item.start.getMonth() - 3)

      if (year == new Date().getFullYear() && new Date().getMonth() < item.id) { // to cancel out the next months
        return await new Promise<number>((resolve) => {
          resolve(0)
        })
      }

      const totalusers = await prisma.user.count({
        where: {
          datecreated: {
            lte: item.end
          }
        }
      })

      return totalusers - processactiveusers[i]
    }))

    // montly new users
    const monthlynewusers = await prisma.user.findMany({
      where: {
        datecreated: {
          gte: selectedmonths[0].start,
          lte: selectedmonths[selectedmonths.length - 1].end,
        }
      },
      select: {
        datecreated: true,
      }
    })

    // group new users montly
    const montlynewuserscount = selectedmonths.map((item) => {
      return monthlynewusers.filter((iter) => new Date(iter.datecreated).getTime() >= item.start.getTime() && new Date(iter.datecreated).getTime() <= item.end.getTime()).length
    })

    const grouped = selectedmonths.map((item) => ({
      id: item.id,
      activeusers: processactiveusers[item.id],
      inactiveusers: montlyinactive[item.id],
      newusers: montlynewuserscount[item.id],
    }))

    return { status: 200, data: grouped }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/user-engagement-data")
    return { status: 500 }
  }
}


export const getWebsitePopularity = async (year: number) => {
  try {

    // get the all months' start and end date of the selected year
    let selectedmonths = months.map((item, i) => {
      return { id: i, start: new Date(year, i, 1), end: new Date(new Date(year, i + 1, 0).setHours(23, 59, 59)) }
    }).sort((a, b) => a.id - b.id)

    const threeMonthsAgooffirstdate = new Date(selectedmonths[0].start)
    threeMonthsAgooffirstdate.setMonth(threeMonthsAgooffirstdate.getMonth() - 2)

    const uservisits = await prisma.sitevisit.findMany({
      where: {
        date: {
          gte: selectedmonths[0].start,
          lte: selectedmonths[selectedmonths.length - 1].end,
        }
      }
    })

    const bookings = await prisma.booking.findMany({
      where: {
        book_at: {
          gte: selectedmonths[0].start,
          lte: selectedmonths[selectedmonths.length - 1].end,
        }
      },
      select: {
        book_at: true,
      }
    })

    const usersvisits = selectedmonths.map((item, i) => {
      return { id: i, visits: uservisits.filter((iter) => new Date(iter.date).getTime() >= item.start.getTime() && new Date(iter.date).getTime() <= item.end.getTime()).length }
    }).sort((a, b) => a.id - b.id)

    const montlybookings = selectedmonths.map((item) => {
      return {
        id: item.id,
        bookcount: bookings.filter((iter) =>
          new Date(iter.book_at).getTime() >= item.start.getTime() && new Date(iter.book_at).getTime() <= item.end.getTime()
        ).length
      }
    }).sort((a, b) => a.id - b.id)

    const grouped = selectedmonths.map((item, i) => ({
      id: item.id,
      visits: usersvisits[i].visits,
      bookings: montlybookings[i].bookcount,
    }))

    return { status: 200, data: grouped }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/user-engagement-data")
    return { status: 500 }
  }
}

