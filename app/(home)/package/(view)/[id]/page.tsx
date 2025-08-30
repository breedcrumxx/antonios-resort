import { options } from "@/app/api/auth/[...nextauth]/options";
import '@/app/configuration.css';
import PackageDataProvider from "@/app/providers/package-data-provider";
import { defaultImportantNotes } from "@/lib/configs/config-file";
import { verifyConfig } from "@/lib/configs/verify-config";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ImageViewer from "./view-components/imageviewer";
import PackageDetails from "./view-components/package-details";
import PackagePriceSummaryWrapper from "./view-components/package-summary-wrapper";
import Retractable from "./view-components/retractable";
import PackageInclusions from "./view-components/services-features";
import PackageRatingAvg from "./view-components/package-rating-avg";

export default async function ViewPackagePage(context: { params: { id: string } }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect(`/signin?callbackUrl`)
    return
  }

  try {

    const dataNotes = await prisma.system.findUnique({
      where: {
        name: "importantnotes"
      }
    })

    const importantNotes = await verifyConfig<string>(dataNotes, "importantnotes", defaultImportantNotes)

    return (
      <div className="min-w-screen min-h-[100vh] bg-muted">
        <div className="w-full flex justify-center">
          <PackageDataProvider packageid={context.params.id}>
            <div className="w-full sm:w-[1000px] space-y-2 py-2">
              <ImageViewer />
              <div className="block sm:flex gap-2">
                <div className="sm:w-3/4 space-y-2">
                  <PackageDetails />
                  <PackageInclusions />
                  <div className="block w-full sm:hidden space-y-2">
                    <PackagePriceSummaryWrapper user={session.user as UserSession} />
                  </div>
                  <Retractable>
                    <h1 className="font-semibold">Important notes:</h1>
                    <div dangerouslySetInnerHTML={{ __html: importantNotes }} />
                  </Retractable>
                  <div id="reviews" className="w-full min-h-[500px] flex flex-col p-5 bg-white border-[1px]">
                    <h1 className="font-semibold">Feedback and ratings from previous guests:</h1>
                    <PackageRatingAvg packageid={context.params.id} />
                  </div>
                </div>

                <div className="hidden sm:block w-1/4 space-y-2">
                  <PackagePriceSummaryWrapper user={session.user as UserSession} />
                </div>
              </div>
            </div>
          </PackageDataProvider>
        </div>
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting package view page.", "GET", "Fatal", "", "/package/view")
    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0003"
          subtitle="This service is currently unavailable, please try again later!"
          fatal
        />
      </div>
    )
  }
}