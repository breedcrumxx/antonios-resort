

import { options } from "@/app/api/auth/[...nextauth]/options";
import { defaultPaymentConfig, PaymentsConfigType } from "@/lib/configs/config-file";
import { verifyConfig } from "@/lib/configs/verify-config";
import { EdgeStoreProvider } from "@/lib/edgestore";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PaymentsConfigForm from "./components/payments-config-form";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";

export default async function PaymentSettingsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/admin/settings/reservation")

  if (!(session.user as UserSession).role.businesscontrol) { // check user control
    redirect("/403")
  }

  try {
    const dataPayment = await prisma.system.findUnique({
      where: {
        name: "paymentsconfig"
      }
    })

    const paymentsConf = await verifyConfig<PaymentsConfigType>(dataPayment, "paymentsconfig", defaultPaymentConfig)

    return (
      <EdgeStoreProvider>
        <PaymentsConfigForm payments={paymentsConf} />
      </EdgeStoreProvider>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting payments configuration page.", "GET", "Moderate", "", "/payments")

    return (
      <div className="w-full h-full">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0013"
          admin
        />
      </div>
    )
  }

}