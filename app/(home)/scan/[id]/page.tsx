
import { options } from "@/app/api/auth/[...nextauth]/options"
import { Card, CardContent } from "@/app/components/ui/card"
import { TabsContent } from "@/app/components/ui/tabs"
import { defaultReservationConfig, devconfig } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { bookingrecord } from "@/lib/zod/z-schema"
import { Result } from "antd"
import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import z from 'zod'
import TabsProvider from "../../../providers/tab-provider"
import ResultComponent from "./components/result"
import RouterBtn from "./components/router-btn"
import ScanContent from "./components/scan-content"
import ScanControls from "./components/scan-controls"
import ScanTabber from "./components/scan-tabber"
import StatementProvider from "./statement-provider"
import { EdgeStoreProvider } from "@/lib/edgestore"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import ZoomerContextProvider from "@/app/admin/(admin)/(dashboard)/bookings/booking-components/zoomer-provider"

export default async function ScannedBookingPage({ params }: { params: { id: string } }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect(`/signin?callbackUrl=/scan`)
    return
  }

  console.log(getBaseUrl())

  if (!(session.user as UserSession).role.utilityaccess) {
    return (
      <div className="min-w-screen min-h-screen">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={<Link href="/" className="py-2 px-4 bg-prm text-white font-semibold hover:text-white">Back Home</Link>}
        />
      </div>
    )
  }

  let booking: z.infer<typeof bookingrecord>

  try {

    const dataReservation = await prisma.system.findUnique({
      where: {
        name: "reservationconfig"
      }
    })

    const reservationconf = await verifyConfig(dataReservation, "reservationconfig", defaultReservationConfig)

    const data = await prisma.booking.findUnique({
      where: {
        bookingid: params.id
      },
      include: {
        client: true,
        transaction: true,
        balance: {
          select: {
            total: true
          }
        },
        legal: true,
        refund: true,
        bookinglog: true,
        appliedcoupons: {
          select: {
            couponcode: true,
            status: true,
            percent: true,
            amount: true,
            minamount: true,
          }
        },
      }
    })

    if (!data) {
      return (
        <Result
          status="404"
          title="No data found!"
          subTitle="Sorry, your data seems to be missing."
          extra={<Link href="/scan" className="py-2 px-4 rounded-sm bg-prm text-white font-semibold hover:text-white">Scan again</Link>}
        />
      )
    }

    booking = { ...data, package: JSON.parse(data.packagedata) } as unknown as z.infer<typeof bookingrecord>

    return (
      <ZoomerContextProvider skip>
        <EdgeStoreProvider>
          <TabsProvider>
            <StatementProvider>
              <ScanTabber>
                <TabsContent value="default">
                  <div className="px-32 py-10 flex gap-4">
                    <div className="w-3/4">
                      <ScanContent data={booking} />
                    </div>
                    <ScanControls
                      data={booking}
                      reservationconfig={reservationconf}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="success">
                  <div className="min-h-screen min-w-screen p-4 px-32 bg-muted space-y-2">
                    <Card>
                      <CardContent>
                        <ResultComponent />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="ended">
                  <div className="min-h-screen min-w-screen p-4 px-32 bg-muted space-y-2">
                    <Card>
                      <CardContent>
                        <Result
                          status="success"
                          title="Checked out!"
                          subTitle="Successfully checked out the booking!"
                          extra={[
                            <RouterBtn link={'/scan'} label="Scan another booking" className="bg-prm" key={0} />,
                          ]}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </ScanTabber>
            </StatementProvider>
          </TabsProvider >
        </EdgeStoreProvider>
      </ZoomerContextProvider>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting scan page.", "GET", "Moderate", "", "/scan/[id]")

    return (
      <div className="min-w-screen min-h-screen flex justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0008"
          subtitle="An error occured while requesting this page, please try again later!"
        />
      </div>
    )
  }
}