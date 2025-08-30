
import { defaultAgreement, defaultCancellationPolicy, defaultImportantNotes, defaultReservationConfig, PaymentsConfigType, PolicyType, ReservationConfigType } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import Retractable from "../(home)/package/(view)/[id]/view-components/retractable"
import { options } from "../api/auth/[...nextauth]/options"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import PackageDataProvider from "../providers/package-data-provider"
import CheckoutHeader from "./checkout-components/checkout-nav/checkout-nav"
import AmountToPay from "./checkout-components/payment-components/amount-topay"
import PaymentForm from "./checkout-components/payment-components/payment-form"
import QRCodesGenerator from "./checkout-components/payment-components/qrcode-generator"
import { DateSetPicker } from "./checkout-components/setup-components/date-set-picker"
import GuestCount from "./checkout-components/setup-components/guest-count"
import PackageCard from "./checkout-components/setup-components/package-card"
import PaymentInformation from "./checkout-components/setup-components/payment-info"
import UserInformation from "./checkout-components/setup-components/user-information"
import BookingDetails from "./checkout-components/summary-components/booking-details"
import ReservationAndTransactionIds from "./checkout-components/summary-components/reservation-transaction-id"
import SummaryTail from "./checkout-components/summary-components/summary-tail"
import TransactionDetails from "./checkout-components/summary-components/transaction-details"
import Tabber from "./checkout-components/tabber"
import CheckoutDataProvider from "./provider"
import './style.css'
import ReceiptDebugger from "./checkout-components/receipt-debugger"
import DownloadReceipt from "./checkout-components/summary-components/download-receipt"

export default async function CheckoutPage({ searchParams }: { searchParams: { id: string } }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect('/signin?callback=checkout')
  }

  try {

    const configs = await prisma.system.findMany({
      where: {
        name: {
          in: [
            "cancellationpolicy",
            "reservationconfig",
            "paymentsconfig",
            "importantnotes",
            "agreement"
          ]
        }
      }
    })

    const dataReservation = configs.find((item) => item.name == "reservationconfig") || null
    const dataPayments = configs.find((item) => item.name == "paymentsconfig") || null
    const dataNotes = configs.find((item) => item.name == "importantnotes") || null
    const dataAgreement = configs.find((item) => item.name == "agreement") || null
    const dataCacellation = configs.find((item) => item.name == "cancellationpolicy") || null

    const reservationConf = await verifyConfig<ReservationConfigType>(dataReservation, "reservationconfig", defaultReservationConfig)
    const paymentsConf = await verifyConfig<PaymentsConfigType>(dataPayments, "paymentsconfig", [])
    const importantNotes = await verifyConfig<string>(dataNotes, "importantnotes", defaultImportantNotes)
    const agreement = await verifyConfig<PolicyType>(dataAgreement, "agreement", defaultAgreement)
    const cancellationConf = await verifyConfig<string>(dataCacellation, "cancellationpolicy", defaultCancellationPolicy)

    return (
      <PackageDataProvider packageid={searchParams.id}>
        <CheckoutDataProvider
          reservationConfig={reservationConf}
          paymentsConfig={paymentsConf}
          agreementContent={agreement}>
          <CheckoutHeader />
          <div className="min-w-screen bg-muted">
            <div className="w-full flex justify-center">
              <div className="w-[1000px]">
                <Tabber>
                  <TabsContent value="setup">
                    <div className="w-full block sm:flex gap-2">
                      <div className="w-full sm:w-3/4 h-auto space-y-2">
                        <div className="w-full p-4 rounded-sm border-[1px] bg-white">
                          <h1 className="font-semibold">Personal Information</h1>
                          <div className="space-y-2 my-2">
                            <UserInformation user={session.user as UserSession} />
                          </div>
                          <br />
                          <h1 className="font-semibold">Reservation information</h1>
                          <DateSetPicker />
                          {/* <GuestCount /> */}
                          <br />
                          <h1 className="font-semibold">Payment information</h1>
                          <PaymentInformation />
                        </div>
                        <Retractable
                          className="hidden sm:block"
                        >
                          <h1 id="notes" className="font-semibold">Important notes:</h1>
                          <div dangerouslySetInnerHTML={{ __html: importantNotes }} />
                        </Retractable>
                      </div>
                      <div className="w-full sm:w-1/4 h-auto space-y-2">
                        <PackageCard
                          cancellationpolicy={cancellationConf}
                          user={session.user as UserSession}
                        />
                      </div>
                      <Retractable
                        className="block px-4 sm:hidden"
                      >
                        <h1 id="notes" className="font-semibold">Important notes:</h1>
                        <div dangerouslySetInnerHTML={{ __html: importantNotes }} />
                      </Retractable>
                    </div>
                  </TabsContent>
                  <TabsContent value="payment">
                    <div className="w-full flex justify-center gap-2">
                      <div className="w-max p-4 rounded-sm border-[1px] space-y-2 bg-white">
                        <Tabs defaultValue="0" className="flex flex-col w-max mx-auto">
                          <div className="mx-auto">
                            <QRCodesGenerator />
                          </div>
                          <br />
                          <TabsList>
                            <TabsTrigger value="0">Payment QR 1</TabsTrigger>
                            <TabsTrigger value="1">Payment QR 2</TabsTrigger>
                            <TabsTrigger value="2">Payment QR 3</TabsTrigger>
                          </TabsList>
                        </Tabs>

                        <AmountToPay />
                        <PaymentForm user={session.user as UserSession} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="summary">
                    {/* <ReceiptDebugger user={session.user as UserSession} /> */}
                    <div className="w-full min-h-screen flex justify-center gap-2">
                      <Card id="receipt" className="w-[400px] space-y-2">
                        <CardHeader>
                          <CardTitle className="text-center">
                            <span className="text-3xl">Antonio&apos;s Resort</span>
                            <br />
                            <span className="text-xl">Reservation receipt</span>
                          </CardTitle>
                          <CardDescription className="text-center">
                            <ReservationAndTransactionIds />
                            <DownloadReceipt />
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="border-y py-4">
                          <div className="w-full">
                            <BookingDetails user={session.user as UserSession} />
                          </div>
                          <Separator className="my-2" />
                          <TransactionDetails />
                        </CardContent>
                        <CardFooter>
                          <div className="w-full space-y-1">
                            <SummaryTail />
                            <Link prefetch href="/" data-html2canvas-ignore="true" className="flex justify-center py-2 text-white bg-prm rounded-md">Return to home page</Link>
                            <Link prefetch href="/package" data-html2canvas-ignore="true" className="flex justify-center py-2 border text-black rounded-md">Book another package</Link>
                            <p className="text-sm text-justify">Thank you for entrusting your plans with us. We will send you an email in a short time once your reservation has been approved.</p>
                            <p className="text-sm text-justify">If you have any questions or concerns, please contact the <span className="hover:underline text-blue-500 cursor-pointer">AR Support</span> or message us on our <a target="_blank" href="https://www.facebook.com/antonios.resort.ne" className="hover:underline text-blue-500 cursor-pointer">Facebook page</a></p>
                            <p></p>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabber>
              </div>
            </div>
          </div>
        </CheckoutDataProvider>
      </PackageDataProvider>
    )
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting checkout page.", "GET", "Fatal", "", "checkout")

    return (
      <div className="min-w-screen min-h-screen flex items-center justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0016"
          fatal
        />
      </div>
    )
  }
}