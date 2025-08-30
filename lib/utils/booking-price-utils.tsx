import { bookingdata, bookingrecord } from "../zod/z-schema"
import z from 'zod'

export const getPrimePackagePrice = (booking: z.infer<typeof bookingrecord>) => {
  return booking.slot == "day" ? (booking.package.day_tour.price) : booking.slot == "night" ? (booking.package.night_tour.price) : booking.slot == "regular" ? (booking.package.regular_stay.price) : 0
}

export const getBookingSubTotal = (booking: z.infer<typeof bookingrecord>) => {
  return getPrimePackagePrice(booking) * booking.quantity * booking.days
}