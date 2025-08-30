'use server'
import { backendClient } from "@/app/api/edgestore/[...edgestore]/edgestore-options"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { Prisma } from "@prisma/client"
import { headers } from "next/headers"
import { createUserLog } from "../account-actions/create-user-log"
import { bookingdata } from "@/lib/zod/z-schema"
import { z } from "zod"
import { getOccupiedDates } from "@/lib/utils/get-occupied-dates"
import { eachDayOfInterval } from "date-fns"

const placebooking = bookingdata.omit({
  id: true,
  bookingid: true,
  refundid: true,
  refund: true,
  transacid: true,
  transaction: true,
  client: true,
  appliedcoupons: true,
  bookinglog: true,
})

export const finalizeBooking = async (
  posttransaction: {
    reference: string,
    referenceimage: string,
    payment_type: string,
    expectedpayment: number,
    type: string,
    date: Date,
  },
  transactionid: string,
  id: string,
  balances: {
    id: string;
    bookingid: string;
    type: string;
    record: string;
    total: number;
  }[],
) => {

  try {

    // start a transaction to prevent messing up the database when error occurs
    await prisma.$transaction(async (tx) => {

      // update the transaction data
      await tx.transaction.update({
        where: {
          transactionid: transactionid
        },
        data: {
          ...posttransaction,
          date: new Date(),
        }
      })

      // fetch the bookingdata 
      const bookingdata = await tx.booking.update({
        where: {
          id: id
        },
        data: {
          status: "Pending"
        },
        select: {
          bookingid: true,
          client: true,
        }
      })

      if (!bookingdata) throw new Error("Missing booking data!")

      // create the balance if there is
      if (balances.length > 0) {
        await tx.balancerecord.createMany({
          data: balances.map((item) => ({ bookingid: id, type: item.type, record: item.record, total: item.total }))
        })
      }

      // create on-system notification
      await tx.notification.create({
        data: {
          head: "New booking",
          type: "admin",
          content: `${bookingdata.client.firstname + " " + bookingdata.client.lastname
            } has placed a booking, check it now!`,
          date: new Date(),
          extra: bookingdata.bookingid,
          extratype: "bookingid",
          userid: bookingdata.client.id,
        }
      })

      // confirm the upload of the file
      await backendClient.publicImages.confirmUpload({
        url: posttransaction.referenceimage,
      });

    })

    createUserLog("User placed a booking.")

    return { status: 200 }
  } catch (error) { //
    if (error instanceof Prisma.PrismaClientKnownRequestError) { // error on existing reference number
      if (error.code === 'P2002') {
        return { status: 409, data: "Reference number already exist, please enter a valid one." }
      }
    }
    await systemLogger(error, Object.fromEntries(headers()), "Finalizing a reservation.", "POST", "Fatal", JSON.stringify({
      posttransaction, id, transactionid, balances
    }), "/process-booking/finalizeBooking")
    return { status: 500, data: "" }
  }

}

export const placePrebook = async (
  posttransaction: {
    reference: string,
    referenceimage: string,
    payment_type: string,
    expectedpayment: number,
    type: string,
    date: Date,
  },
  prebook: z.infer<typeof placebooking>
): Promise<{
  status: 200;
  data: {
    transactionid: string;
    bookingid: string;
    id: string;
  }
} | {
  status: 500;
} | {
  status: 400;
} | {
  status: 409;
}> => {
  try {

    // start a transaction to prevent messing up the database when error occurs
    return await prisma.$transaction(async (tx) => {

      // check the dates here
      const occupiedresponse = await getOccupiedDates(prebook.packageid)

      if (occupiedresponse.status == 500) throw new Error()
      else {
        const lockdates = occupiedresponse.data?.map((item) => {
          const collection: Date[] = []
          for (let i = 0; i < item.quantity; i++) {
            collection.push(...eachDayOfInterval({ start: item.checkin, end: item.checkout }))
          }
          return collection
        })
          .flat() as Date[]

        const userdaterange = eachDayOfInterval({ start: prebook.checkin, end: prebook.checkout })
        const isValidSelection = !userdaterange.some(date => lockdates.filter((item) => item.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)).length >= prebook.quantity);

        if (!isValidSelection) return { status: 409 } // if the dates collided
      }

      const id = new Date().getTime().toString()

      // create a temporary transaction
      const transaction = await tx.transaction.create({
        data: {
          ...posttransaction,
          transactionid: `AR-T-${id}`,
          reference: `AR-T-${id}`,
        }
      })

      // create a prebook 
      const bookingresponse = await tx.booking.create({
        data: {
          bookingid: `AR-B-${id}`,
          book_at: prebook.book_at,
          checkin: prebook.checkin,
          checkout: prebook.checkout,
          slot: prebook.slot,
          days: prebook.days,

          quantity: prebook.quantity,

          adults: prebook.adults,
          seniorpwds: prebook.seniorpwds,
          teenkids: prebook.teenkids,

          total: prebook.total,
          status: prebook.status,

          // totaldiscount: prebook.totaldiscount,
          downpaymentasofnow: prebook.downpaymentasofnow,
          clientid: prebook.clientid,
          packageid: prebook.packageid,
          packagedata: prebook.packagedata,
          transacid: transaction.id,

          appliedcoupons: {
            connect: prebook.couponids.map((item) => ({ id: item }))
          },

          lastacceptedprivacy: prebook.lastacceptedprivacy,
          lastacceptedagreement: prebook.lastacceptedagreement,
          lastacceptedtermscondition: prebook.lastacceptedtermscondition,
        },
        select: {
          id: true,
          bookingid: true,
          client: true
        }
      })

      // update the users agreed policy date
      await tx.user.update({
        where: {
          id: prebook.clientid
        },
        data: {
          lastacceptedprivacy: prebook.lastacceptedprivacy,
          lastacceptedtermscondition: prebook.lastacceptedtermscondition,
          lastacceptedagreement: prebook.lastacceptedagreement,
        }
      })

      // check for the status, and adjust the endpoint target
      const queueLink = 'https://antonios-db-engine.onrender.com/prebook' // only uncomment on dev when local server is not available
      // const queueLink = process.env.NODE_ENV === "production" ? 'https://antonios-db-engine.onrender.com/prebook' : 'http://localhost:5000/prebook'

      // place a queue 
      const response = await fetch(queueLink, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingid: bookingresponse.bookingid })
      })

      console.log(response)

      if (!response.ok) return { status: 400 } // if cannot place a queue

      await createUserLog("User prebook a reservation and waiting for payment.")

      return { status: 200, data: { transactionid: transaction.transactionid, bookingid: bookingresponse.bookingid, id: bookingresponse.id } }
    })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Placing a prebook data.", "POST", "Fatal", JSON.stringify({
      posttransaction, prebook,
    }), "/process-booking/placePrebook")
    return { status: 500 }
  }
}

export const continuePayment = async (
  posttransaction: {
    reference: string,
    referenceimage: string,
    payment_type: string,
    expectedpayment: number,
    type: string,
    date: Date,
  },
  balances: {
    id: string;
    bookingid: string;
    type: string;
    record: string;
    total: number;
  }[],
  transactionid: string,
): Promise<{
  status: 200 | 409 | 500
}> => {
  try {
    await prisma.$transaction(async (tx) => {
      // update the transaction
      await tx.transaction.update({
        where: {
          id: transactionid
        },
        data: {
          reference: posttransaction.reference,
          referenceimage: posttransaction.referenceimage,
          date: new Date(),
        }
      })

      // update the booking status
      const bookingdata = await tx.booking.update({
        where: {
          transacid: transactionid
        },
        data: {
          status: "Pending"
        },
        select: {
          id: true,
          client: true,
          bookingid: true,
        }
      })

      if (!bookingdata) throw new Error("Missing booking data!")

      // check for any balances
      if (balances.length > 0) {
        await tx.balancerecord.createMany({
          data: balances.map((item) => ({ bookingid: bookingdata.id, type: item.type, record: item.record, total: item.total }))
        })
      }

      // create on-system notification
      await tx.notification.create({
        data: {
          head: "New booking",
          type: "admin",
          content: `${bookingdata.client.firstname + " " + bookingdata.client.lastname
            } has placed a booking, check it now!`,
          date: new Date(),
          extra: bookingdata.bookingid,
          extratype: "bookingid",
          userid: bookingdata.client.id,
        }
      })

      // confirm the image
      await backendClient.publicImages.confirmUpload({
        url: posttransaction.referenceimage,
      });

      // create a user log
      await createUserLog("Finished unpaid booking.")
    })

    return { status: 200 }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) { // error on existing reference number
      if (error.code === 'P2002') {
        return { status: 409 }
      }
    }
    await systemLogger(error, Object.fromEntries(headers()), "Finishing unpaid booking.", "POST", "Fatal", JSON.stringify({
      posttransaction,
      transactionid,
    }), "/process-booking/continue-payment")
    return { status: 500 }
  }
}