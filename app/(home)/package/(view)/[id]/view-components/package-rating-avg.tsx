import { rateStatementGenerator } from "@/lib/actions/booking-actions/rate-statement-gen"
import { defaultprofile } from "@/lib/configs/config-file"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { user } from "@/lib/zod/z-schema"
import { Rate } from "antd"
import { format } from "date-fns"
import { headers } from "next/headers"
import Image from 'next/image'
import { z } from "zod"
import { ViewMoreFeedbacks } from "./comment-box"
import './style.css'

interface Rating {
  client: z.infer<typeof user>;
  rating: number;
  comment: string;
  date: { [key: string]: Date };
}

export default async function PackageRatingAvg({ packageid }: { packageid: string }) {

  try {
    const data = await prisma.ratinglinks.findMany({
      where: {
        used: true,
        packageid: packageid,
      },
      select: {
        rated_at: true,
        experience: true,
        cleanliness: true,
        facility: true,
        service: true,
        comment: true,
        booking: {
          select: {
            client: {
              select: {
                image: true,
                firstname: true,
                lastname: true,
              }
            }
          }
        }
      },
      orderBy: {
        rated_at: 'desc'
      }
    })

    const avg = data.reduce((a, b) => a + ((b.experience + b.cleanliness + b.facility + b.service) / 4), 0) / data.length

    return (
      <>
        <div className="w-full block sm:flex gap-4">
          <div className="w-full sm:w-auto gap-4 my-5">
            <div className="w-full">
              <p className="font-semibold text-lg"><span className="text-5xl">{isNaN(avg) ? 0 : avg.toFixed(2)}</span> / 5.0</p>
              <p className="font-semibold">{rateStatementGenerator(avg)}</p>
              <p className="text-sm">{data.length} reviews</p>
            </div>

            <div className="grid grid-cols-2 row-span-2 sm:block space-y-2 py-4">
              <div>
                <Rate allowHalf value={data.reduce((a, b) => a + b.experience, 0) / data.length} disabled />
                <p className="font-semibold text-xs">Experience</p>
              </div>
              <div>
                <Rate allowHalf value={data.reduce((a, b) => a + b.cleanliness, 0) / data.length} disabled />
                <p className="font-semibold text-xs">Cleanliness</p>
              </div>
              <div>
                <Rate allowHalf value={data.reduce((a, b) => a + b.facility, 0) / data.length} disabled />
                <p className="font-semibold text-xs">Facility</p>
              </div>
              <div>
                <Rate allowHalf value={data.reduce((a, b) => a + b.service, 0) / data.length} disabled />
                <p className="font-semibold text-xs">Service</p>
              </div>
            </div>
          </div>
          <div className="flex-grow flex gap-2 sm:py-4">
            <div className="w-full min-h-[400px] space-y-2 px-4 sm:border-l">
              {
                data.slice(0, 3).map((item, i) => {
                  const avg = (item.experience + item.cleanliness + item.facility + item.service) / 4
                  return (
                    <div className="w-full p-2 max-h-[200px] rounded-md hover:bg-muted/50" key={i}>
                      <div className="flex gap-2 items-center">
                        <div className="h-[50px] w-[50px] rounded-full overflow-hidden relative">
                          <Image
                            src={item.booking.client.image || defaultprofile}
                            className="w-full h-auto object-fit aspect-square"
                            alt="profile-image"
                            fill
                          />
                        </div>
                        <div>
                          <p className="capitalize text-sm font-semibold">{item.booking.client.firstname + " " + item.booking.client.lastname}</p>
                          <p className="text-xs">{format(item.rated_at as Date, "PPP")}</p>
                        </div>
                      </div>
                      <Rate
                        className="comment"
                        allowHalf
                        value={avg}
                        disabled
                      />
                      <div className="w-full py-2 text-sm text-justify max-h-[150px] overflow-hidden">
                        {item.comment}
                      </div>
                    </div>
                  )
                })
              }
              {
                data.length > 3 && (
                  <ViewMoreFeedbacks
                    packageid={packageid}
                  />
                )
              }
            </div>
          </div>
        </div>

      </>
    )
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting package reviews.", "GET", "Minor", "", "/package-rating-avg")

    return (
      <div id="reviews" className="w-full flex justify-center gap-4 my-5">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="CMP-ERR-0001"
          subtitle="Sorry, we are unable to get all the feedbacks and ratings, please try again later."
        />
      </div>
    )
  }

}