'use server'
import prisma from "@/lib/prisma"
import { cancellationReasons, rejectionReasons } from "@/lib/utils/configurable-data"
import { months } from "@/lib/utils/month-filter-utils"
import { bookingrecord, extendedpackageoffer, extendedservice, legals, ratinglink } from "@/lib/zod/z-schema"
import { faker } from '@faker-js/faker'
import axios from "axios"
import bcrypt from 'bcrypt'
import cuid from "cuid"
import { add, eachDayOfInterval, isEqual, sub } from "date-fns"
import { readFileSync, writeFileSync } from "fs"
import { headers } from "next/headers"
import z from 'zod'

const feedbackGroups = [
  [
    'Poor service.',
    'Not satisfied.',
    'Would not recommend.',
    'Bad experience.',
    'Very disappointed.'
  ],
  [
    'Fair experience.',
    'Could be better.',
    'Service was lacking in some areas.',
    'Not the best experience.',
    'Somewhat disappointed.'
  ],
  [
    'Good service overall.',
    'Met my expectations.',
    'Decent experience.',
    'Okay for the price.',
    'Service was fine.'
  ],
  [
    'Very good service.',
    'Would recommend to others.',
    'Satisfied with the experience.',
    'Good value for money.',
    'Overall a positive experience.'
  ],
  [
    'Excellent experience.',
    'Will avail again next time.',
    'Highly recommended!',
    'Top-notch service.',
    'Exceeded my expectations.'
  ],
];

type PartialBookingSession = {
  id: string,
  continues: boolean,
  units: number,
  startdate: Date,
  enddate: Date,
  timein: string,
  duration: number,
  discount: number,
  services: z.infer<typeof extendedservice>[],
  balance: number,
}

const getBookingLogs = (data: PartialBookingSession) => {
  const [hours, minutes] = data.timein.split(":")

  let sessions = []

  let startdate = data.startdate
  for (let i = 1; i <= data.units; i++) {
    const enddate = add(startdate, { hours: data.duration })

    if (isEqual(new Date(startdate).setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0))) {
      sessions.push({
        // id: "",
        status: "Started",
        // bookingid: "",
        datestart: startdate,
        dateend: enddate,
        datein: startdate,
        dateout: enddate,
        services: "",
      })
    } else {
      sessions.push({
        // id: "",
        status: "Not started",
        // bookingid: "",
        datestart: startdate,
        dateend: enddate,
        datein: startdate,
        dateout: enddate,
        services: "",
      })
    }

    if (isEqual(new Date(startdate).setHours(0, 0, 0, 0), new Date(enddate).setHours(0, 0, 0, 0))) {
      startdate = add(startdate, { days: 1 })
    } else { // the duration of the package made the end out not match
      startdate = new Date(new Date(enddate).setHours(parseInt(hours), parseInt(minutes), 0, 0))
    }
  }

  return sessions.map((item) => ({ ...item, status: "Ended", services: JSON.stringify(data.services) }))
}

function getRandDate(year: number, month: number) {
  // Get the number of days in the specified month and year
  const daysInMonth = new Date(year, month, 0).getDate();

  // Generate a random day between 1 and the number of days in the month
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;

  // Return a new Date object with the random day
  return new Date(year, month - 1, randomDay); // month is 0-indexed in Date
}

function generateRandomValues() {
  const totalLimit = 4;

  // Random value for adults
  let adults = Math.floor(Math.random() * (totalLimit + 1));

  // Random value for seniorpwds, keeping the total limit in mind
  let seniorpwds = Math.floor(Math.random() * (totalLimit - adults + 1));

  // Random value for teenkids, making sure the total is within the limit
  let teenkids = Math.floor(Math.random() * (totalLimit - adults - seniorpwds + 1));

  // Return the values
  return { adults, seniorpwds, teenkids };
}

export const parsePackages = async (year: string, month: string, packages: z.infer<typeof extendedpackageoffer>[]) => {

  const start = new Date(parseInt(year), months.indexOf(month), 1)
  const end = new Date(parseInt(year), months.indexOf(month) + 1, 0)

  const refimage = "https://files.edgestore.dev/7uz0f7szgfzmbmnh/publicImages/_public/092240a7-9cd9-43d8-b1f8-5d885adfbee6.jpg"
  const sign = "https://files.edgestore.dev/7uz0f7szgfzmbmnh/publicImages/_public/f43aaf5e-713c-4c4d-9f51-18d668cc4706.jpeg"

  const dates = eachDayOfInterval({ start, end })
  let consumedDates: Date[] = []
  let data: any[] = []

  const paymentTypes = ['Down payment', 'Full payment']

  const users = await prisma.user.findMany({
    where: {
      datecreated: {
        lte: end
      },
      role: {
        role: "Client"
      }
    }
  })

  console.log(users)

  // 3 - 8 bookings completed
  // 1 - 3 bookings cancelled
  // 1 - 3 bookings rejected

  const maxCompleted = Math.round(Math.max((Math.random() * 8), 3))
  const maxCancelled = Math.round(Math.max((Math.random() * 3), 1))
  const maxRejected = Math.round(Math.max((Math.random() * 3), 1))

  const produce = async (packages: z.infer<typeof extendedpackageoffer>[], status: string) => {

    let margin = packages.length - 1
    let run = 0

    if (status == 'Completed') run = maxCompleted
    if (status == 'Rejected') run = maxCancelled
    if (status == 'Cancelled') run = maxRejected

    for (let i = 0; i < run; i++) {

      // init values
      let paymenttype = paymentTypes[Math.random() < 0.5 ? 0 : 1]

      // get random reasons for cancelled and rejected
      let reason = ""
      if (status == "Cancelled") reason = cancellationReasons[Math.floor(Math.random() * 8)].value
      if (status == "Rejected") reason = rejectionReasons[Math.floor(Math.random() * 7)].value

      // get random user
      const user = users[Math.floor(Math.random() * (users.length / 2))]

      // BREAKER
      if (maxCompleted == data.filter((item) => item.booking.status == "Completed").length && status == "Completed") break
      if (maxCancelled == data.filter((item) => item.booking.status == "Cancelled").length && status == "Cancelled") break
      if (maxRejected == data.filter((item) => item.booking.status == "Rejected").length && status == "Rejected") break

      // get a random package
      const selectedpackage = packages[Math.round(Math.random() * margin)]

      await new Promise(resolve => setTimeout(resolve, 10))

      const type = selectedpackage.type
      let slot = ""

      let checkin: Date;
      let checkout: Date;

      let bookingtotal = 0
      const downpayment = type == "regular" ? 100 : (paymenttype == "Down payment" ? 30 : 100)
      let amountpaid = 0

      let adultfees = 0
      let seniorfees = 0
      let teenfees = 0

      let date: Date;

      while (true) {
        date = getRandDate(parseInt(year), months.indexOf(month))
        if (type == "villa") {
          const timeinHours = parseInt(selectedpackage.day_tour.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.day_tour.timein.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(add(checkin, { hours: selectedpackage.day_tour.duration }))
          slot = "day"
          bookingtotal = selectedpackage.day_tour.price
          amountpaid = bookingtotal * (downpayment / 100)
        } else if (type == "event") {
          const timeinHours = parseInt(selectedpackage.day_tour.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.day_tour.timein.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(add(checkin, { hours: selectedpackage.day_tour.duration }))
          slot = "day"
          bookingtotal = selectedpackage.day_tour.price
          amountpaid = bookingtotal * (downpayment / 100)
        } else {
          const timeinHours = parseInt(selectedpackage.regular_stay.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.regular_stay.timein.split(":")[1])
          const timeoutHours = parseInt(selectedpackage.regular_stay.timeout.split(":")[0])
          const timeoutMinutes = parseInt(selectedpackage.regular_stay.timeout.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(new Date(checkin).setHours(timeoutHours, timeoutMinutes, 0, 0))
          slot = "regular"
          bookingtotal = selectedpackage.regular_stay.price
          amountpaid = bookingtotal * (downpayment / 100)

          adultfees = 2 * 120
          seniorfees = 1 * 90
          teenfees = 1 * 90
        }

        // check the dates 
        const range = eachDayOfInterval({ start: checkin, end: checkout })

        const exist = range.some((a) => consumedDates.some((b) => new Date(a).setHours(0, 0, 0, 0) == new Date(b).setHours(0, 0, 0, 0)))

        if (!exist) break
      }

      const { adults, seniorpwds, teenkids } = generateRandomValues()

      const booking = {
        bookingid: `AR-B-${new Date().getTime()}`,
        book_at: sub(date, { days: 3 }),
        checkin: checkin,
        checkout: checkout,
        slot: slot,
        days: 1,
        packageid: selectedpackage.id,
        quantity: 1,
        adults,
        seniorpwds,
        teenkids,
        status: status,
        total: bookingtotal,
        downpaymentasofnow: 30,
        clientid: user.id,
        packagedata: JSON.stringify(selectedpackage),
      }

      // calculate the payment base on payment type
      let balancerecord = []
      if (amountpaid != bookingtotal) {
        balancerecord.push({
          type: "Payment balance",
          record: `Balance of ₱ ${bookingtotal - amountpaid} for this booking.`,
          total: bookingtotal - amountpaid,
        })
      }

      if (status == "Completed" && type == "regular") {
        balancerecord.push(
          {
            type: "Entrance",
            record: `Balance of ₱ ${adultfees.toLocaleString()} for adult entrance fees.`,
            total: adultfees
          },
          {
            type: "Entrance payment",
            record: `Balance of ₱ ${adultfees.toLocaleString()} paid.`,
            total: parseFloat("-" + adultfees)
          },
          {
            type: "Entrance",
            record: `Balance of ₱ ${seniorfees.toLocaleString()} for senior/PWD entrance fees.`,
            total: seniorfees
          },
          {
            type: "Entrance payment",
            record: `Balance of ₱ ${seniorfees.toLocaleString()} paid.`,
            total: parseFloat("-" + seniorfees)
          },
          {
            type: "Entrance",
            record: `Balance of ₱ ${teenfees.toLocaleString()} for teen/kids entrance fees.`,
            total: teenfees
          },
          {
            type: "Entrance payment",
            record: `Balance of ₱ ${teenfees.toLocaleString()} paid.`,
            total: parseFloat("-" + teenfees)
          })
      }

      const transaction = {
        transactionid: `AR-T-${new Date().getTime()}`,
        reference: cuid(),
        referenceimage: refimage,
        payment_type: paymenttype,
        expectedpayment: amountpaid,
        type: "Booking",
        date: sub(date, { days: 3 }),
      }

      const pkgrate = Math.round(Math.random() * 4) + 1
      const service = Math.round(Math.random() * 4) + 1
      const quality = Math.round(Math.random() * 4) + 1
      const value = Math.round(Math.random() * 4) + 1

      const avg = (pkgrate + service + quality + value) / 4

      let rating = null
      let bookinglog: any = []
      let legal = null

      if (status == "Completed") {
        rating = {
          created_at: checkout,
          rated_at: checkout,
          used: true,
          packageid: selectedpackage.id,

          experience: pkgrate,
          cleanliness: service,
          facility: quality,
          service: value,

          comment: feedbackGroups[Math.min(Math.max(Math.round(avg), 0), 4)][Math.floor(Math.random() * 5)],
        }

        bookinglog.push({
          status: "Check-in",
          log_at: checkin,
        }, {
          status: "Check-out",
          log_at: checkout,
        })

        legal = {
          paid_on: checkin,
          amount: 1000,
          refunded_amount: Math.round(1000 * Math.random()),
          signature: sign,
          refunded_on: checkout
        }
      }

      let refund = {
        refundableuntil: add(checkout, { days: 7 }),
        isvalid: true,
        refundables: 0,
        refunded: false,
      }

      let rejectionandcancellation = null
      // check if status or cancelled and manipulate the data
      if (status == "Cancelled" || status == "Rejected") {
        rejectionandcancellation = { // create a rejection or cancellation record
          reason: reason,
          type: status,
          created_at: add(date, { days: 1 })
        }

        // recalculate the refund
        refund = {
          refundableuntil: add(checkout, { days: 7 }),
          isvalid: true,
          refundables: amountpaid,
          refunded: Math.random() < 0.5 ? false : true,
        }
      }

      data.push({
        booking: booking,
        transaction: transaction,
        ratinglink: rating,
        refund: refund,
        bookinglog: bookinglog,
        rejectionandcancellation: rejectionandcancellation,
        balancerecord: balancerecord,
        legal: legal,
      })

      consumedDates.push(...eachDayOfInterval({ start: checkin, end: checkout }))

    }

    for (const selectedpackage of packages) {
      // get a random payment type
      let paymenttype = paymentTypes[Math.random() < 0.5 ? 0 : 1]

      // get random reasons for cancelled and rejected
      let reason = ""
      if (status == "Cancelled") { // get a random reason
        reason = cancellationReasons[Math.floor(Math.random() * 8)].value
      } else if (status == "Rejected") {
        reason = rejectionReasons[Math.floor(Math.random() * 7)].value
      }

      // get random user
      const user = users[Math.floor(Math.random() * (users.length / 2))]

      // cut the entire loop if the max number reached
      if (maxCompleted == data.filter((item) => item.booking.status == "Completed").length && status == "Completed") {
        break
      }
      if (maxCancelled == data.filter((item) => item.booking.status == "Cancelled").length && status == "Cancelled") {
        break
      }
      if (maxRejected == data.filter((item) => item.booking.status == "Rejected").length && status == "Rejected") {
        break
      }

      for (let date of dates.slice(1, -1)) { // loop the date collection to find a space for the current package

        await new Promise(resolve => setTimeout(resolve, 10))

        const type = selectedpackage.type
        let slot = ""

        let checkin: Date;
        let checkout: Date;

        let bookingtotal = 0
        const downpayment = type == "regular" ? 100 : (paymenttype == "Down payment" ? 30 : 100)
        let amountpaid = 0

        let adultfees = 0
        let seniorfees = 0
        let teenfees = 0

        if (type == "villa") {
          const timeinHours = parseInt(selectedpackage.day_tour.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.day_tour.timein.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(add(checkin, { hours: selectedpackage.day_tour.duration }))
          slot = "day"
          bookingtotal = selectedpackage.day_tour.price
          amountpaid = bookingtotal * (downpayment / 100)
        } else if (type == "event") {
          const timeinHours = parseInt(selectedpackage.day_tour.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.day_tour.timein.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(add(checkin, { hours: selectedpackage.day_tour.duration }))
          slot = "day"
          bookingtotal = selectedpackage.day_tour.price
          amountpaid = bookingtotal * (downpayment / 100)
        } else {
          const timeinHours = parseInt(selectedpackage.regular_stay.timein.split(":")[0])
          const timeinMinutes = parseInt(selectedpackage.regular_stay.timein.split(":")[1])
          const timeoutHours = parseInt(selectedpackage.regular_stay.timeout.split(":")[0])
          const timeoutMinutes = parseInt(selectedpackage.regular_stay.timeout.split(":")[1])
          checkin = new Date(new Date(date).setHours(timeinHours, timeinMinutes, 0, 0))
          checkout = new Date(new Date(checkin).setHours(timeoutHours, timeoutMinutes, 0, 0))
          slot = "regular"
          bookingtotal = selectedpackage.regular_stay.price
          amountpaid = bookingtotal * (downpayment / 100)

          adultfees = 2 * 120
          seniorfees = 1 * 90
          teenfees = 1 * 90
        }

        const booking = {
          bookingid: `AR-B-${new Date().getTime()}`,
          book_at: sub(date, { days: 3 }),
          checkin: checkin,
          checkout: checkout,
          slot: slot,
          days: 1,
          packageid: selectedpackage.id,
          quantity: 1,
          adults: 2,
          seniorpwds: 1,
          teenkids: 1,
          status: status,
          total: bookingtotal,
          downpaymentasofnow: 30,
          clientid: user.id,
          packagedata: JSON.stringify(selectedpackage),
          lastacceptedprivacy: new Date(),
          lastacceptedagreement: new Date(),
          lastacceptedtermscondition: new Date(),
        }

        // calculate the payment base on payment type
        let balancerecord = []
        if (amountpaid != bookingtotal) {
          balancerecord.push({
            type: "Payment balance",
            record: `Balance of ₱ ${bookingtotal - amountpaid} for this booking.`,
            total: bookingtotal - amountpaid,
          })
        }

        if (status == "Completed" && type == "regular") {
          balancerecord.push(
            {
              type: "Entrance",
              record: `Balance of ₱ ${adultfees.toLocaleString()} for adult entrance fees.`,
              total: adultfees
            },
            {
              type: "Entrance payment",
              record: `Balance of ₱ ${adultfees.toLocaleString()} paid.`,
              total: parseFloat("-" + adultfees)
            },
            {
              type: "Entrance",
              record: `Balance of ₱ ${seniorfees.toLocaleString()} for senior/PWD entrance fees.`,
              total: seniorfees
            },
            {
              type: "Entrance payment",
              record: `Balance of ₱ ${seniorfees.toLocaleString()} paid.`,
              total: parseFloat("-" + seniorfees)
            },
            {
              type: "Entrance",
              record: `Balance of ₱ ${teenfees.toLocaleString()} for teen/kids entrance fees.`,
              total: teenfees
            },
            {
              type: "Entrance payment",
              record: `Balance of ₱ ${teenfees.toLocaleString()} paid.`,
              total: parseFloat("-" + teenfees)
            })
        }

        const transaction = {
          transactionid: `AR-T-${new Date().getTime()}`,
          reference: cuid(),
          referenceimage: refimage,
          payment_type: paymenttype,
          expectedpayment: amountpaid,
          type: "Booking",
          date: sub(date, { days: 3 }),
        }

        const pkgrate = Math.round(Math.random() * 4) + 1
        const service = Math.round(Math.random() * 4) + 1
        const quality = Math.round(Math.random() * 4) + 1
        const value = Math.round(Math.random() * 4) + 1

        const avg = (pkgrate + service + quality + value) / 4

        let ratinglink = null
        let bookinglog: any = []

        if (status == "Completed") {
          ratinglink = {
            created_at: checkout,
            rated_at: checkout,
            used: true,
            packageid: selectedpackage.id,

            package: pkgrate,
            service: service,
            quality: quality,
            value: value,

            comment: feedbackGroups[Math.min(Math.max(Math.round(avg), 0), 4)][Math.floor(Math.random() * 5)],
          }

          bookinglog.push({
            status: "Check-in",
            log_at: checkin,
          }, {
            status: "Check-out",
            log_at: checkout,
          })
        }

        let refund = {
          refundableuntil: add(checkout, { days: 7 }),
          isvalid: true,
          refundables: 0,
          refunded: false,
        }

        let rejectionandcancellation = null
        // check if status or cancelled and manipulate the data
        if (status == "Cancelled" || status == "Rejected") {
          rejectionandcancellation = { // create a rejection or cancellation record
            reason: reason,
            type: status,
            created_at: add(date, { days: 1 })
          }

          // recalculate the refund
          refund = {
            refundableuntil: add(checkout, { days: 7 }),
            isvalid: true,
            refundables: amountpaid,
            refunded: Math.random() < 0.5 ? false : true,
          }
        }

        data.push({
          booking: booking,
          transaction: transaction,
          ratinglink: ratinglink,
          refund: refund,
          bookinglog: bookinglog,
          rejectionandcancellation: rejectionandcancellation,
          balancerecord: balancerecord
        })

        consumedDates.push(...eachDayOfInterval({ start: checkin, end: checkout }))

        break
      }
    }
  }

  let reversed = packages
  let operations = ['Rejected', 'Cancelled', 'Completed']
  for (let operation of operations) {
    let spins = 1
    if (operation == "Completed") {
      spins = 3
    }
    await produce(reversed, operation)
    reversed.reverse()
    consumedDates = []
  }

  console.log("Done!")
  return data

  writeFileSync(`./app/test/components/bookings/${month}-${year}-bookings.json`, JSON.stringify(data))
}

export const genYearlyBooking = async (year: string) => {

  try {
    let response = await axios.get('https://localhost:3000/api/packages/offers/dev')
    const packagescollection = response.data

    const collection = []

    let selectedMonths = months
    if (new Date().getFullYear() == parseInt(year)) {
      selectedMonths = months.slice(0, new Date().getMonth())
    }

    for (let month of selectedMonths) {
      const data = await parsePackages(year, month, packagescollection)
      collection.push(...data)
    }

    writeFileSync(`./app/development/components/bookings/${year}-bookings.json`, JSON.stringify(collection))

    console.log("Done batch generation!")
  } catch (error) {
    console.log(error)
  }

}

export const insertBookings = async (filename: string) => {
  try {
    const stringbookings = readFileSync(`./app/development/components/bookings/${filename}-bookings.json`, 'utf-8')
    const bookings = JSON.parse(stringbookings)

    const withoutidenticalid: any = []
    bookings.map((item: any) => {
      if (!withoutidenticalid.some((iter: any) => iter.booking.bookingid == item.booking.bookingid)) {
        withoutidenticalid.push(item)
      }
    })

    // console.log(withoutidenticalid.length)
    // console.log(bookings.length)

    await prisma.$transaction(async (tx) => {
      for (let { booking, transaction, bookinglog, ratinglink, refund, rejectionandcancellation, balancerecord, legal } of withoutidenticalid) {

        console.log({ booking, transaction, bookinglog, ratinglink, refund, rejectionandcancellation, balancerecord })

        console.log("inserting refunds!")

        // create the refund record
        let refunddata = null
        if (refund) {
          refunddata = await tx.refunds.create({
            data: refund
          })
        }


        console.log("inserting transaction!")

        const transactiondata = await tx.transaction.create({
          data: transaction
        })
        console.log("inserted transaction!")

        let query: any = {
          data: {
            ...booking,
            transacid: transactiondata.id,
          }
        }

        query = {
          data: {
            ...query.data,
            refundid: refunddata?.id as string,
          }
        }

        if (balancerecord.length > 0) {
          query = {
            data: {
              ...query.data,
              balance: {
                create: balancerecord
              },
            }
          }
        }

        if (bookinglog.length > 0) {
          query = {
            data: {
              ...query.data,
              bookinglog: {
                create: bookinglog
              }
            }
          }
        }

        if (ratinglink) {
          query = {
            data: {
              ...query.data,
              ratinglinks: {
                create: ratinglink
              }
            }
          }
        }

        if (legal) {
          const data = await tx.legal.create({
            data: legal
          })

          query = {
            data: {
              ...query.data,
              legalid: data.id,
            }
          }
        }

        console.log("fetching user!")

        const user = await tx.user.findUnique({
          where: {
            id: booking.clientid
          }
        })

        if (!user) throw new Error()

        const userip = headers().get("x-forwarded-for") || "Unknown"
        const device = headers().get("sec-ch-ua-platform") || "Unknown"
        const webloc = headers().get("referer") || "Unknown"

        console.log("inserting user logs!")

        await tx.user.update({
          where: {
            id: user.id
          },
          data: {
            userlogs: {
              create: {
                ipaddress: userip,
                device: device,
                activity: "Placed a booking.",
                weblocation: webloc,
                logdate: booking.book_at,
              }
            }
          }
        })

        console.log("inserting booking!")

        const bookingdata = await tx.booking.create({
          ...query
        })

        if (rejectionandcancellation) {
          console.log("inserting rejection!")
          await tx.rejectionandcancellation.create({
            data: {
              ...rejectionandcancellation,
              bookingid: bookingdata.id
            }
          })
        }

        await tx.notification.create({
          data: {
            head: "New booking",
            type: "admin",
            content: `${user.firstname + " " + user.lastname
              } has placed a booking, verify it now!`,
            date: booking.book_at,
            extra: bookingdata.id,
            extratype: "bookingid",
            userid: user.id,
          }
        })

      }
    }, { maxWait: 60000, timeout: 200000 })

    console.log("Done!")
  } catch (error) {
    console.error(error)
  }
}

export const batchInsert = async (year: string) => {
  // for (let month of months) {
  // }

  await insertBookings(`${year}`)
  console.log("Done batch insertion!")
}

export const randomUserDateCreated = async () => {

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        data: {
          datecreated: new Date()
        }
      })
    })

    console.log("Done!")
  } catch (error) {
    console.error(error)
  }
}

export const wipeBookings = async () => {
  try {
    await prisma.$transaction(async (tx) => {

      await tx.balancerecord.deleteMany()
      await tx.rejectionandcancellation.deleteMany()
      await tx.bookinglog.deleteMany()
      await tx.ratinglinks.deleteMany()
      await tx.refunds.deleteMany()
      await tx.chat.deleteMany()
      await tx.discussion.deleteMany()
      await tx.booking.deleteMany()
      await tx.transaction.deleteMany()
      await tx.notification.deleteMany()
    }, { maxWait: 60000, timeout: 60000 })

    console.log("Done!")
  } catch (error) {
    console.error(error)
  }
}

export const checker = async (filename: string) => {
  const stringbookings = readFileSync(`./app/test/components/${filename}-bookings.json`, 'utf-8')
  const bookings = JSON.parse(stringbookings)

  const completedbookings = bookings.filter((item: any) => item.booking.status == "Completed")

  console.log(completedbookings.reduce((a: any, b: any) => a + b.booking.total, 0))

}

function getRandomDate() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get the time difference in milliseconds
  const timeDiff = now.getTime() - startOfYear.getTime();

  // Generate a random number of milliseconds within the time difference
  const randomTime = Math.floor(Math.random() * timeDiff);

  // Create a new date with the random time added to the start of the year
  const randomDate = new Date(startOfYear.getTime() + randomTime);

  return randomDate;
}


// website visits
export const generateRandomVisits = async (year: string) => {

  const generateUniqueSiteVisit = (usedIPs: Set<string>, year: string, month: number) => {
    let ip;
    do {
      ip = faker.internet.ip();
    } while (usedIPs.has(ip));

    usedIPs.add(ip);

    const lastDay = new Date(parseInt(year), month, 0).getDate();

    // Generate a random day between 1 and the last day of the month
    const randomDay = Math.floor(Math.random() * lastDay) + 1;

    return {
      id: faker.database.mongodbObjectId(),
      device: faker.internet.userAgent(),
      address: ip,
      date: new Date(parseInt(year), month, randomDay),
    };
  };


  let selectedMonths = months
  if (new Date().getFullYear() == parseInt(year)) selectedMonths = months.slice(0, new Date().getMonth())

  const siteVisits: {
    month: string,
    montlyvisit: {
      id: string;
      device: string;
      address: string;
      date: Date;
    }[]
  }[] = [];
  const usedIPs = new Set<string>();

  selectedMonths.map((month, index) => {
    const maxgen = Math.floor(Math.random() * 60) + 30
    const montlyvisit = []

    for (let i = 0; i < maxgen; i++) {
      montlyvisit.push(generateUniqueSiteVisit(usedIPs, year, index));
    }

    siteVisits.push({
      month,
      montlyvisit
    })
  })

  // Save the mock data to a file (optional)
  writeFileSync(`./app/development/components/visits/${year}-visits.json`, JSON.stringify(siteVisits))
  console.log("Done")

}

export const insertWebsiteVisits = async (year: string) => {
  const stringvisits = readFileSync(`./app/development/components/visits/${year}-visits.json`, 'utf-8')
  const visitobject = JSON.parse(stringvisits)

  const visits = visitobject.map((item: any) => item.montlyvisit).flat()

  try {

    await prisma.sitevisit.createMany({
      data: visits.map((item: any) => ({ device: item.device, address: item.address, date: item.date }))
    })

    console.log("Done!")
  } catch (error) {
    console.log(error)
  }
}

export const generateUsers = async (year: string) => {

  const role = await prisma.role.findUnique({
    where: {
      role: "Client"
    },
    select: {
      id: true,
    }
  })

  if (!role) {
    console.log("Role not found!")
    return
  }

  let selectedMonths = months
  if (new Date().getFullYear() == parseInt(year)) selectedMonths = months.slice(0, new Date().getMonth() + 1)

  const defaultpass = await bcrypt.hash("12345678", 10)
  const users: any = []

  selectedMonths.map((month, index) => {
    // 0 - 5
    const maxgen = Math.round(Math.random() * 4) + 1
    const monthlyregisters: any = []

    for (let i = 0; i < maxgen; i++) {

      const firstname = faker.person.firstName()
      const lastname = faker.person.lastName()

      const user = {
        email: firstname + lastname + "@email.com",
        firstname: firstname,
        lastname: lastname,
        password: defaultpass,
        roleid: role.id,
        datecreated: new Date(parseInt(year), index, 1),
        lastacceptedprivacy: new Date(),
        lastacceptedtermscondition: new Date(),
        userlogs: {
          create: [
            {
              ipaddress: faker.internet.ip(),
              device: faker.internet.userAgent(),
              weblocation: "https://antonios.com/signin",
              activity: "Registered an account.",
              logdate: new Date(parseInt(year), index, 1),
            },
            {
              ipaddress: faker.internet.ip(),
              device: faker.internet.userAgent(),
              weblocation: "https://antonios.com/signin",
              activity: "User logged in.",
              logdate: new Date(parseInt(year), index, 1),
            }
          ]
        }
      }

      monthlyregisters.push(user)
    }

    users.push({
      month,
      monthlyregisters
    })
  })

  writeFileSync(`./app/development/components/users/${year}-users.json`, JSON.stringify(users))
  console.log("Done")
}

export const insertUsers = async (year: string) => {

  try {
    const stringusers = readFileSync(`./app/development/components/users/${year}-users.json`, 'utf-8')
    const usercollection: {
      month: string,
      monthlyregisters: {
        email: string,
        firstname: string,
        lastname: string,
        password: string,
        roleid: string,
        datecreated: Date,
        lastacceptedprivacy: Date,
        lastacceptedtermscondition: Date,
        userlogs: {
          create: {
            ipaddress: string,
            device: string,
            weblocation: string,
            activity: string,
            logdate: Date,
          }[]
        }
      }[]
    }[] = JSON.parse(stringusers)

    // console.log(JSON.stringify(usercollection, null, 4))

    await prisma.$transaction(async (tx) => {
      for (let collection of usercollection) {
        for (let user of collection.monthlyregisters) {
          await tx.user.create({
            data: user
          })
        }
      }
    }, { maxWait: 60000, timeout: 60000 })

    console.log("Done!")
  } catch (error) {
    console.error(error)
  }

}

export const wipeUsers = async () => {
  try {

    await prisma.$transaction(async (tx) => {
      await tx.userlogs.deleteMany({
        where: {
          user: {
            email: {
              notIn: ["dandan213123@gmail.com", "ravensanao@gmail.com", "danrosete890@gmail.com"]
            }
          }
        }
      })

      await tx.user.deleteMany({
        where: {
          email: {
            notIn: ["dandan213123@gmail.com", "ravensanao@gmail.com", "danrosete890@gmail.com"]
          }
        },
      })
    })

    console.log("Users wiped!")
  } catch (error) {
    console.log(error)
  }
}

export const rankTheErrors = async () => {
  try {
    const data = await prisma.systemerrorlogs.findMany({
      select: {
        id: true
      }
    })

    const severity = ['Fatal', 'Moderate', 'Minor']

    for (let item of data) {
      await prisma.systemerrorlogs.update({
        where: {
          id: item.id
        },
        data: {
          severity: severity[Math.floor(Math.random() * severity.length)]
        }
      })
    }

    console.log("Done!")
  } catch (error) {
    console.error(error)
  }
}
