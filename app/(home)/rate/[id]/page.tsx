

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { TabsContent } from "@/app/components/ui/tabs";
import prisma from "@/lib/prisma";
import { Result } from 'antd';
import Link from "next/link";
import z from 'zod';
import FeedbackWriter from "./components/feedback-writter";
import PackageDetails from "./components/package-details";
import StarPicker from "./components/star-picker";
import SubmitRating from "./components/submit-rating";
import RatingContextProvider from "./provider";
import { systemLogger } from "@/lib/utils/api-debugger";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { ratinglink } from "@/lib/zod/z-schema";

export default async function RatingsPage({ params }: { params: { id: string } }) {

  const session = await getServerSession(options)

  if (!session) redirect(`/signin?callbackUrl=/rate/${params.id}`)

  try {
    const data = await prisma.ratinglinks.findUnique({
      where: {
        id: params.id
      },
      include: {
        booking: true
      }
    })

    if (!data) {
      return (
        <div className="">
          <Result
            status="404"
            title="404"
            subTitle="We cannot find what you are looking for, please try again later!"
            extra={<Link href="/" className='px-4 py-2 bg-prm hover:text-white font-semibold text-white rounded-sm'>Back Home</Link>}
          />
        </div>
      )
    }

    return (
      <div className="h-screen min-w-screen bg-muted flex justify-center p-10">
        <RatingContextProvider
          data={data as unknown as z.infer<typeof ratinglink>}
          userid={(session.user as UserSession).id}
        >
          <TabsContent value="default">
            <Card>
              <CardHeader>
                <CardTitle>Rate us!</CardTitle>
                <CardDescription>Take a minute and give use a feedback.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 h-max w-[40vw]">
                <PackageDetails />

                <StarPicker />
                <FeedbackWriter />
                <SubmitRating />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="success">
            <Card>
              <CardHeader>
                <CardTitle>Rate us!</CardTitle>
                <CardDescription>Take a minute and give use a feedback.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 h-max w-[40vw]">
                <Result
                  status="success"
                  title="Successfully submitted your feedback!"
                  subTitle="Thank you for sharing your experience with us! Your feedback helps us make your next stay even better. We look forward to welcoming you back soon!"
                  extra={[
                    <Link key="home" href="/" className="py-2 px-4 bg-prm text-white hover:text-white rounded-sm">Back to home</Link>,
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </RatingContextProvider>
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting rate page.", "GET", "Moderate", "", "/rate")

    return (
      <div className="h-screen min-w-screen bg-muted flex justify-center p-10">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0005"
          subtitle="An unknown error occured, please try again later!"
        />
      </div>
    )
  }
}