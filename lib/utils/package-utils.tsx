import { extendedbasepackage, extendedservice, user } from "@/lib/zod/z-schema"
import z from 'zod'

export const checkApplicableDiscount = (basepackage: z.infer<typeof extendedbasepackage>, creator: z.infer<typeof user> | UserSession) => {
  return (basepackage.applyadmin && creator.role.businesscontrol) || (basepackage.applyclient && creator.role.websiteaccess && !creator.role.businesscontrol)
}

export const getFinalPrice = (data: z.infer<typeof extendedbasepackage>, services: z.infer<typeof extendedservice>[], creator: z.infer<typeof user>) => {
  const packageprice = data.baseprice * data.basetype.duration
  const servicestotal = services.reduce((a, b) => a + b.price, 0)

  if (checkApplicableDiscount(data, creator)) {
    return ((packageprice + servicestotal) - ((packageprice + servicestotal) * (data.packagediscount / 100)))
  }

  return (packageprice + servicestotal)
}

export const isDiscountable = (data: z.infer<typeof extendedbasepackage>, creator: z.infer<typeof user>) => {
  let discount = 0

  if (checkApplicableDiscount(data, creator)) {
    return data.packagediscount
  }

  return discount
}