'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"

export const getInsightsData = async (span: number) => {

  try {

    const dates = Array.from({ length: span }, (_, n) => new Date().getMonth() - n)
      .map((item) => ({
        start: new Date(new Date().getFullYear(), item),
        end: new Date(new Date().getFullYear(), item + 1, 0),
      }))

    const newusers = await prisma.user.findMany({
      where: {
        datecreated: {
          gte: dates[dates.length - 1].start,
        }
      }
    })

    const activeusers = await prisma.user.findMany({
      where: {
        userlogs: {
          some: {
            logdate: {
              gte: dates[dates.length - 1].start,
              lte: dates[0].end,
            }
          },
        },
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        clientid: {
          in: [...newusers.map((item) => item.id), ...activeusers.map((item) => item.id)]
        },
        book_at: {
          gte: dates[dates.length - 1].start,
          lte: dates[0].end,
        }
      },
      select: {
        clientid: true
      }
    })

    const bookingsovernewuser = Math.round((bookings.filter((item) => newusers.some((iter) => iter.id == item.clientid)).length / newusers.length) * 10)

    const bookingsoveractiveuser = (bookings.filter((item) => activeusers.some((iter) => iter.id == item.clientid)).length / activeusers.length)

    // get the packages
    const packages = await prisma.packages.findMany({
      select: {
        id: true,
        packagename: true,
        ratings: {
          where: {
            used: true
          }
        },
      }
    })

    // the bookings that placed in the given date span
    const bookingsinspan = await prisma.booking.findMany({
      where: {
        checkout: {
          gte: dates[dates.length - 1].start,
          lte: dates[0].end,
        },
      },
      select: {
        status: true,
        packageid: true,
        balance: true,
        total: true,
      }
    })

    // get the total earnings each of the package
    const totalofcompletedbookings = packages
      .map((item) => {

        const totalofthesebookings = bookingsinspan
          .filter((booking) => {
            return booking.packageid == item.id
          })
          .reduce((a, b) => a + b.total, 0)

        return {
          id: item.id,
          packagename: item.packagename,
          totalearnings: totalofthesebookings
        }
      })
      .sort((a, b) => b.totalearnings - a.totalearnings)

    const topthreepackages = totalofcompletedbookings
      .slice(0, 3)
      .concat(totalofcompletedbookings.length < 3 ? new Array(3 - totalofcompletedbookings.length).fill(null) : [])

    // top package with highest rating
    const packageswithrating = packages.map((item) => {
      const ratings = item.ratings
        .filter((rating) => rating.used)
        .map((rating) => { return (rating.experience + rating.cleanliness + rating.facility + rating.service) / 4 })
        .reduce((a, b) => a + b, 0) / item.ratings
          .filter((rating) => rating.used).length

      return {
        id: item.id,
        customname: item.packagename,
        averageratings: ratings,
      }
    }).sort((a, b) => b.averageratings - a.averageratings)

    const highestavgpackageratings = packageswithrating
      .slice(0, 3)
      .concat(totalofcompletedbookings.length < 3 ? new Array(3 - totalofcompletedbookings.length).fill(null) : [])

    // ratio of bookings
    const completedbookingratio = bookingsinspan.filter((item) => item.status == "Completed").length / bookingsinspan.length
    const completedoutoften = Math.round(completedbookingratio * 10)

    const cancelledratio = bookingsinspan.filter((item) => item.status == "Cancelled").length / bookingsinspan.length
    const cancelledoutoften = Math.round(cancelledratio * 10)

    const rejectedratio = bookingsinspan.filter((item) => item.status == "Rejected").length / bookingsinspan.length
    const rejectedoutoften = Math.round(rejectedratio * 10)


    return {
      status: 200, data: {
        bookingsovernewuser,
        bookingsoveractiveuser,
        completedoutoften,
        cancelledoutoften,
        rejectedoutoften,
        topthreepackages,
        highestavgpackageratings
      }
    }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting analytics data.", "GET", "Minor", "", "/findings-data")
    return { status: 500 }
  }

}