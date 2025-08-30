

import { options } from "@/app/api/auth/[...nextauth]/options";
import { ReservationConfigType, defaultReservationConfig } from "@/lib/configs/config-file";
import { verifyConfig } from "@/lib/configs/verify-config";
import { EdgeStoreProvider } from "@/lib/edgestore";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ReservationConfigForm from "./components/reservation-config-form";

export default async function ReservationSettingsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/admin/settings/reservation")

  if (!(session.user as UserSession).role.businesscontrol) { // check user control
    redirect("/403")
  }

  try {
    const dataReservation = await prisma.system.findUnique({
      where: {
        name: "reservationconfig"
      }
    })

    const reservationConf = await verifyConfig<ReservationConfigType>(dataReservation, "reservationconfig", defaultReservationConfig)

    return (
      <EdgeStoreProvider>
        <ReservationConfigForm config={reservationConf} />
      </EdgeStoreProvider>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting payments configuration page.", "GET", "Moderate", "", "/payments")
    return (
      <div className="h-max px-4 overflow-y-scroll scroll">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0014"
          subtitle="An error occured while trying to request this page, please try again later!"
          admin
        />
      </div>
    )
  }
}