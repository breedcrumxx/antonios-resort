'use server'

import prisma from "@/lib/prisma"

export const forceReschedule = async (bookingid: number, newdate: Date, isFree: string, fee: number) => {

  try {

    // calculate the slot
    // calculate the new package price
    // 

    // get a copy of the current booking state
    // const data = await prisma.changeInBooking.create({
    //   data:  {
    //     bookingid: prebook.bookingid,
    //     bookdate: prebook.bookdate,
    //     datein: prebook.datein,
    //     dateout: prebook.dateout,
    //     slot: prebook.slot,
    //     total: prebook.total,
    //     agreement: prebook.agreement,
    //     status: "Unpaid",
    //     topay: prebook.topay,
    //     pricingId: prebook.package.id,
    //     changedmade: new Date,
    //     addons: {
    //       create: addonIds
    //     },
    //     userId: prebook.user.id
    //   }
    // })
    // craete a change in booking copy (default to approved)
    // create a transction
    // update the date of the original booking
    // create a booking history

    return { status: 200 }
  } catch (error) {
    console.error(error)
    return { status: 500 }
  }
}