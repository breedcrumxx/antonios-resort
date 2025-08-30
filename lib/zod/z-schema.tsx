
import z from 'zod';

export const role = z.object({
  id: z.string(),
  role: z.string()
    .min(1, { message: "Please give this role a title!" }),
  systemcontrol: z.boolean(),
  businesscontrol: z.boolean(),
  websitecontrol: z.boolean(),
  utilityaccess: z.boolean(),
  websiteaccess: z.boolean(),
})

// new schema
export const user = z.object({
  id: z.string(),
  email: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  role: role,
  datecreated: z.date(),
  verified: z.boolean(),
  block: z.date().nullable(),
  image: z.string(),
})

export const basepackage = z.object({
  id: z.string(),
  basename: z.string().min(1, { message: "Please enter a base package name!" })
    .min(8, { message: "Please elaborate your package name!" }),
  basedescription: z.string().min(1, { message: "Please enter a base package name!" })
    .min(10, { message: "Please make your description elaborative!" }),
  typeid: z.string().min(1, { message: "Please select a type!" }),
  baseprice: z.coerce.number().int({ message: "Please enter a valid value!" })
    .gt(1, { message: "Please enter a valid price!" })
    .gte(200, { message: "Minimum price of 200!" })
    .lte(1000, { message: "Price is too high!" }),
  packagediscount: z.coerce.number().int()
    .gt(1, { message: "Please enter a valid value!" })
    .gte(5, { message: "Minimum discount of 5%!" })
    .lte(30, { message: "Discount value too high!" }),
  applyadmin: z.boolean(),
  applyclient: z.boolean(),
  status: z.boolean(),
})

// isolated

export const packagetype = z.object({
  id: z.string(),
  typename: z.string().min(0, { message: "Please enter a valid typename!" }).min(6, { message: "Please give a descriptive name!" }),
  timein: z.string().min(4, { message: "Please set a time slot!" }),
  continuesoffer: z.boolean(),
  duration: z.coerce.number().
    gt(0, { message: "Please enter a hour duration!" })
    .gte(5, { message: "Minimum duration of 5 hours!" }),
  status: z.boolean()
})

export const packageimages = z.object({
  id: z.string(),
  imageurl: z.string(),
  packageid: z.string(),
})

export const packageoffer = z.object({
  id: z.string(),
  packagename: z.string(),
  packagedescription: z.string(),
  maxpax: z.number(),

  type: z.string(), // VILLA = can be continued | EVENT = continues false | COTTAGE = continues false
  day_tour: z.string().nullable(),
  night_tour: z.string().nullable(),
  regular_stay: z.string().nullable(),

  status: z.string(),

  penaltyamount: z.number(), // exclude on cottages
  extendable: z.boolean(), // only available to events
  extendprice: z.number(), // only available to events
  discount: z.number(),

  inclusion: z.array(z.string()),
  quantity: z.number(),
  images: z.array(z.string()),
})

export const defaultschedules = z.object({
  id: z.string(),
  type: z.string()
    .min(1, { message: "Please select a type!" }),
  slot: z.string()
    .min(1, { message: "Please select a slot!" }),
  timein: z.string()
    .min(1, { message: "Please provide a check-in time!" }),
  timeout: z.string()
    .min(1, { message: "Please provide a check-out time!" }), // for cottages
  duration: z.number()
    .min(1, { message: "Please provide a duration!" })
    .gte(5, { message: "Minimum should be greater than 5!" }), // for villas
  price: z.number(),
  status: z.boolean(),
})

export const PackageSchedule = z.object({
  timein: z.string(),
  timeout: z.string(),
  duration: z.number(),
  price: z.number(),
  status: z.boolean()
})

export const transactiondata = z.object({
  id: z.string(),
  transactionid: z.string(),
  reference: z.string(),
  referenceimage: z.string(),
  payment_type: z.string(),
  expectedpayment: z.number(),
  type: z.string(),
  date: z.date()
})

export const balancerecord = z.object({
  id: z.string(),
  bookingid: z.string(),
  type: z.string(),
  record: z.string(),
  total: z.number()
})

export const refunds = z.object({
  id: z.string(),
  refundableuntil: z.date(),
  isvalid: z.boolean(),
  refundables: z.number(),
  refunded: z.boolean(),
})

export const bookingsession = z.object({
  id: z.string(),
  status: z.string(),
  bookingid: z.string(),
  log_at: z.date(),
})

export const coupons = z.object({
  id: z.string(),
  couponcode: z.string(),
  couponname: z.string()
    .min(1, { message: "Give your coupon a name!" }),
  coupondescription: z.string()
    .min(1, { message: "Give your coupon a short decription!" }),
  create_at: z.date(),
  validuntil: z.date(),
  status: z.string(),
  type: z.string()
    .min(1, { message: "Please choose a coupon type!" }),
  max: z.number()
    .int({ message: "Please enter a solid number!" })
    .gte(1, { message: "Set coupon count!" }),
  percent: z.boolean(),
  amount: z.number()
    .gte(1, { message: "Please put a valid value!" }),
  minamount: z.number(),
  applicableto: z.enum(['cottage', 'villa', 'event', 'reschedule']),
})

export const legals = z.object({
  id: z.string(),
  paid_on: z.date(),
  amount: z.number(),
  refunded_amount: z.number(),
  signature: z.string(),
  refunded_on: z.date().nullable(),
})

export const bookingdata = z.object({
  id: z.string(),
  bookingid: z.string(),
  book_at: z.date(),
  checkin: z.date(),
  checkout: z.date(),
  slot: z.string(), // day | night
  days: z.number(),
  packageid: z.string(),
  packagedata: z.string(),
  quantity: z.number(),

  // guest head count
  adults: z.number(),
  seniorpwds: z.number(),
  teenkids: z.number(),
  celebrant: z.number(),

  total: z.number(),
  // totaldiscount: z.number(),
  downpaymentasofnow: z.number(),
  status: z.string(),

  legal: legals.nullable(),

  refundid: z.string().nullable(),
  refund: refunds.nullable(),
  balance: z.array(balancerecord),
  transacid: z.string(),
  transaction: transactiondata,

  clientid: z.string(),
  client: user,
  bookinglog: z.array(bookingsession),

  couponids: z.array(z.string()),
  appliedcoupons: z.array(coupons),

  lastacceptedprivacy: z.date(),
  lastacceptedagreement: z.date(),
  lastacceptedtermscondition: z.date(),
})

export const ratinglink = z.object({
  id: z.string(),
  used: z.boolean(),
  created_at: z.date(),
  rated_at: z.date().nullable(),
  bookingid: z.string(),
  packageid: z.string(),
  experience: z.number(),
  facility: z.number(),
  cleanliness: z.number(),
  service: z.number(),
  comment: z.string(),
  booking: bookingdata
})

export const extendedpackageoffer = packageoffer.omit({
  day_tour: true,
  night_tour: true,
  regular_stay: true,
}).extend({
  day_tour: PackageSchedule,
  night_tour: PackageSchedule,
  regular_stay: PackageSchedule,
  booking: z.array(bookingdata),
  bookingcount: z.number(),
  avgratings: z.number(),
  ratingcount: z.number()
})

export const bookingrecord = bookingdata.extend({
  package: extendedpackageoffer,
  ratinglink: ratinglink.nullable(),
})

export const extendedcoupons = coupons.extend({
  userids: z.array(z.string()),
  bookingids: z.array(z.string()),
  user: z.array(user),
  bookings: z.array(bookingrecord)
})

export const collection = z.object({
  id: z.string(),
  collectionname: z.string()
    .min(1, { message: "Please enter a collection name!" }),
  collectiondescription: z.string()
    .min(1, { message: "Please enter a description!" }),
  images: z.array(z.string())
    .min(4, { message: "Please upload at least 4 images!" })
    .max(50, { message: "A maximum of 50 images only" }),
  createdat: z.date(),
})

export const concernform = z.object({
  name: z.string()
    .min(1, { message: "What should we call you?" })
    .min(3, { message: "A name is at least 3 characters long!" }),
  email: z.string()
    .min(1, { message: "Please enter your email!" })
    .email({ message: "Please enter a valid email!" }),
  subject: z.string()
    .min(1, { message: "Please write your subject of concern!" }),
  concern: z.string()
    .min(1, { message: "Please write your concern!" })
    .min(10, { message: "It's good to elaborate your concern!" }),
})

// #

// DEPRICATED
export const extendbasetype = z.object({
  basetype: packagetype
})

export const category = z.object({
  id: z.string(),
  categoryname: z.string().min(1, { message: "Please enter a category name!" })
    .min(5, { message: "Please be descriptive!" }),
  status: z.boolean(),
})

export const service = z.object({
  id: z.string(),
  servicename: z.string().min(1, { message: "Please enter a category name!" })
    .min(5, { message: "Please be more descriptive!" }),
  status: z.string(),
  price: z.coerce.number().int({ message: "Please enter a valid value!" })
    .gt(1, { message: "Please enter a valid price!" })
    .gte(200, { message: "Minimum price of 200!" })
    .lte(5000, { message: "Price is too high!" }),
  categoryid: z.string().min(1, { message: "Please salect a category!" }),
  deleted: z.boolean(),
})

// extend the service to include the category for each services
export const extendedservice = service.extend({ category: category })

// extend the category to include each services
export const extendedcategory = category.extend({ service: z.array(service) })

const includeservices = z.object({
  included: z.array(extendedservice)
})

export const images = z.object({
  images: z.array(z.object({
    id: z.string(),
    thumbnailurl: z.string().nullable(),
    imageurl: z.string(),
    basepackageid: z.string()
  }))
})

export const extendedbasepackage = basepackage.merge(extendbasetype).merge(includeservices).merge(images)

export const ratings = z.object({
  id: z.string(),
  keyid: z.string(),
  package: z.number(),
  service: z.number(),
  quality: z.number(),
  value: z.number(),
  overall: z.number(),
  comment: z.string(),
})

export const ratingkeys = z.object({
  id: z.string(),
  used: z.boolean(),
  date: z.date(),
  bookingid: z.string(),
  rating: ratings.nullable()
})

export const custompackage = z.object({
  id: z.string(),
  basepackageid: z.string(),
  customname: z.string(),
  customdescription: z.string(),
  creatorid: z.string(),
  status: z.string(),
}).merge(z.object({
  basepackage: basepackage.merge(extendbasetype).merge(includeservices).merge(images)
})).merge(z.object({
  services: z.array(extendedservice)
})).merge(z.object({
  creator: user
}))
// .merge(z.object({
//   ratingkeys: z.array(ratingkeys)
// }))

export const packagewithratings = custompackage.extend({
  ratings: z.object({
    packageid: z.string(),
    rating: z.number(),
    count: z.number(),
  }).nullable()
})



// overriden included type
export const overridencustompackage = custompackage.extend({
  included: z.object({
    id: z.string(),
    servicename: z.string(),
    price: z.coerce.number()
  })
})



// booking schema

export const saferatings = ratingkeys.omit({ rating: true }).extend({ rating: ratings }).extend({ booking: bookingdata })

export const extendedbookingsession = bookingsession.extend({ booking: bookingdata })

export const chat = z.object({
  id: z.string(),
  date: z.number(),
  seen: z.boolean(),
  status: z.string(), // sending | sent | failed
  type: z.string(),
  sender: z.string(),
  content: z.string(),
  discussionid: z.string(),
})

export const discussion = z.object({
  id: z.string(),
  discussionid: z.string(),
  date: z.date(),
  recentactivity: z.number(),
  type: z.string(),
  status: z.string(),
  // seen: z.boolean(),
  bookingid: z.string(),
  userid: z.string(),
  allowinteract: z.boolean(),
  chats: z.array(chat),
  user: z.optional(user),
  booking: z.optional(bookingdata),
})

export const notification = z.object({
  id: z.string(),
  head: z.string(),
  content: z.string(),
  type: z.string(),
  read: z.boolean(),
  date: z.date(),
  extratype: z.string().nullable(),
  extra: z.string().nullable(),
  user: user.nullable(),
})

export const extendeddiscussion = user.extend({ discussion: z.array(discussion) })

// export const extendedratingkeys = z.object({
//   id: z.string(),
//   used: z.boolean(),
//   date: z.date(),
//   bookingid: z.string(),

//   booking: bookingdata
// })

export const cancellationrejection = z.object({
  id: z.string(),
  bookingid: z.string(),
  reason: z.string(),
  type: z.string(),
  created_at: z.date()
})

export const userinfosummary = z.object({
  _count: z.object({
    booking: z.number(),
    mycoupons: z.number(),
  }),
  totalcompleted: z.number(),
}).merge(user)
  .extend({ completedbookings: z.array(bookingrecord) })

export const userlog = z.object({
  id: z.string(),
  userid: z.string(),
  ipaddress: z.string(),
  device: z.string(),
  activity: z.string(),
  weblocation: z.string(),
  logdate: z.date(),
})

export const systemerrorlog = z.object({
  id: z.string(),
  message: z.string(),
  code: z.string(),
  stacktrace: z.string(),
  requestmethod: z.string(),
  userip: z.string(),
  requesturl: z.string(),
  requestheaders: z.string(),
  datetime: z.date(),
  requestbody: z.string(),
  useraction: z.string(),
  severity: z.string(),
  userid: z.string(),
  user: user.nullable()
})

// SALES

export const packagesales = z.object({
  id: z.string(),
  packagename: z.string(),
  totalpending: z.number(),
  totalcompleted: z.number(),
  growth: z.number(),
})

export const featuressales = z.object({
  id: z.string(),
  featurename: z.string(),
  categoryid: z.string(),
  categoryname: z.string(),
  count: z.number(),
  growth: z.number(),
  totalcompleted: z.number()
})

export const LoginFormSchema = z.object({
  email: z.string().min(1, { message: "Please provide your email!" }),
  password: z.string().min(1, { message: "Please provide your password!" }),
})

export const AccountFormSchema = z.object({
  email: z.string().email("Please put a valid email address!"),
  firstname: z.string().min(1, { message: "This field is required!" }),
  lastname: z.string().min(1, { message: "This field is required!" }),
  password: z.string().min(1, { message: "This field is required!" }).min(8, { message: "Password too short." }),
  confirm: z.string().min(1, { message: "This field is require!" }).min(8, { message: "Password too short." }),
})

export const AccountLoginFormSchema = AccountFormSchema.omit({ firstname: true, lastname: true, confirm: true })

export const maintenanceschema = z.object({
  id: z.string(),
  title: z.string()
    .min(1, { message: "Please write a label!" })
    .min(8, { message: "Please make it descriptive!" }),
  memo: z.string()
    .min(1, { message: "Please write a description!" })
    .min(10, { message: "Please make it descriptive!" }),
  type: z.string(),
  coverage: z.string()
    .min(1, { message: "Please select a maintenance coverage!" }),
  status: z.string(),
  duration: z.number()
    .min(1, { message: "Please select a maintenance duration!" }),
  issuedate: z.date(),
  lastupdated: z.date(),
  start: z.date(),
  end: z.date(),
  initiatorid: z.string(),
  initiator: user
})

export const problemreport = z.object({
  id: z.string(),
  issueid: z.string(),
  report: z.string(),
  severity: z.string(),
  code: z.string(),
  errormessage: z.string(),
  stacktrace: z.string(),
  status: z.string(), // Unsolved | Resolved
  datetime: z.date(),
  image: z.string().nullable(),
  userid: z.string().nullable(),
  user: user.nullable(),
  issueId: z.array(z.string()),
})

export const issue = z.object({
  id: z.string(),
  issueid: z.number(),
  sampleids: z.array(z.string()),
  samples: z.array(problemreport),
})

export const catalog = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  datecreated: z.date(),
})