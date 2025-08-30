'use client'

import { Separator } from "@/app/components/ui/separator"
import { useEffect, useState } from "react"
import { getInsightsData } from "../callback-actions/insights-data"
import { Spinner } from "@nextui-org/spinner"
import { Ban, Book, Check, X } from "lucide-react"
import { Steps } from "antd"

const getBookingPerformanceCategory = (completedOutOfTen: number) => {
  if (completedOutOfTen === 10) return 'Outstanding Performance';
  if (completedOutOfTen >= 9) return 'Excellent Performance';
  if (completedOutOfTen >= 7) return 'Good Performance';
  if (completedOutOfTen >= 5) return 'Average Performance';
  if (completedOutOfTen >= 3) return 'Below Average';
  return 'Poor Performance';
};

const getAdminFeedbackStatement = (averageRating: number): string => {
  if (averageRating === 5) {
    return 'Clients are extremely satisfied with the experience. The service is highly valued and performing at an exceptional level. Continue to maintain and build on this excellence.';
  }
  if (averageRating >= 4) {
    return 'Clients are very satisfied with the experience. The service is performing well, but there is still room for minor improvements to achieve top satisfaction.';
  }
  if (averageRating >= 3) {
    return 'Clients are generally satisfied with the experience. While the feedback is positive, there are areas that could be improved to enhance client satisfaction.';
  }
  if (averageRating >= 2) {
    return 'Clients have mixed feelings about the experience. There are significant areas for improvement. Focus on addressing the issues raised to boost overall satisfaction.';
  }
  return 'Clients are dissatisfied with the experience. Immediate action is needed to address major concerns and improve service quality.';
};

export default function InsightModal({ span }: { span: number }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [insightsData, setInsightsData] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getInsightsData(span)
      setLoading(false)


      if (response.status == 500) return

      console.log(response.data)
      setInsightsData(response.data)
    }

    setLoading(true)
    fetchData()

  }, [span])

  return (
    <>
      {
        loading ? (
          <div className="flex-grow flex items-center justify-center">
            <Spinner label="Loading..." />
          </div>
        ) : (
          <div className="flex-grow overflow-y-scroll scroll">
            <div className="px-6">
              <h1 className="font-semibold text-gray-500">Booking analysis</h1>
              <br />
              <Steps
                direction="vertical"
                current={4}
                items={[
                  {
                    icon: <Book className="w-auto h-full text-amber-500" />,
                    title: <p className="text-xl font-semibold">{insightsData.bookingsovernewuser} out of 10 new users</p>,
                    description: <p className="text-sm text-gray-600">Approximately {insightsData.bookingsovernewuser} new user/s are placing a new booking.</p>,
                  },
                  {
                    icon: <Book className="w-auto h-full text-green-500" />,
                    title: <p className="text-xl font-semibold">{(insightsData.bookingsoveractiveuser as number).toFixed(2)} Booking/s</p>,
                    description: <p className="text-sm text-gray-600">An average of {(insightsData.bookingsoveractiveuser as number).toFixed(2)} booking/s per active user are placed every month.</p>,
                  },
                  {
                    icon: <Check className="w-auto h-full text-blue-500" />,
                    title: <p className="text-xl font-semibold">{insightsData.completedoutoften} out of 10 Bookings</p>,
                    description: <p className="text-sm text-gray-600">Are completed</p>,
                  },
                  {
                    icon: <Ban className="w-auto h-full text-red-500" />,
                    title: <p className="text-xl font-semibold">{insightsData.cancelledoutoften} out of 10 Bookings</p>,
                    description: <p className="text-sm text-gray-600">Are cancelled</p>,
                  },
                  {
                    icon: <X className="w-auto h-full text-red-500" />,
                    title: <p className="text-xl font-semibold">{insightsData.rejectedoutoften} out of 10 Bookings</p>,
                    description: <p className="text-sm text-gray-600">Are rejected</p>,
                  },
                ]}
              />

              <div className="space-y-2">
                <h1 className="text-md font-semibold text-gray-500">System says:</h1>
                <div className="px-4 space-y-2">
                  <p className="text-md">Bookings - <span className="text-md font-semibold">{getBookingPerformanceCategory(insightsData.completedoutoften as number)}</span></p>
                  <p className="text-md">User engagement - <span className="text-md font-semibold">{getBookingPerformanceCategory(insightsData.overnewusers as number)}</span></p>
                  <p className="text-md">Clients feedback - <span className="text-md font-semibold">{getAdminFeedbackStatement(insightsData.ratings as number)}</span></p>
                </div>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="px-6 space-y-4">
              <div className="space-y-2">
                <h1 className="font-semibold text-gray-500">Top 3 Package with highest earnings</h1>
                <div className="flex gap-2">
                  <p>1.</p>
                  <div>
                    <p className="text-xl font-semibold">{insightsData.topthreepackages[0].packagename || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.topthreepackages[0] ? `With a total of ₱ ${(insightsData.topthreepackages[0].totalearnings as number).toLocaleString()} earnings.` : "- No Data -"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>2.</p>
                  <div>
                    <p className="text-lg font-semibold">{insightsData.topthreepackages[1].packagename || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.topthreepackages[2] ? `With a total of ₱ ${(insightsData.topthreepackages[1].totalearnings as number).toLocaleString()} earnings.` : "- No Data -"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>3.</p>
                  <div>
                    <p className="text-md font-semibold">{insightsData.topthreepackages[2].packagename || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.topthreepackages[2] ? `With a total of ₱ ${(insightsData.topthreepackages[2].totalearnings as number).toLocaleString()} earnings.` : "- No Data -"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="font-semibold text-gray-500">Top 3 Package with highest rating</h1>
                <div className="flex gap-2">
                  <p>1.</p>
                  <div>
                    <p className="text-xl font-semibold">{insightsData.highestavgpackageratings[0].customname || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.highestavgpackageratings[0] ? `With a total of ${(insightsData.highestavgpackageratings[0].averageratings as number).toFixed(2)} ratings.` : "- No Data -"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>2.</p>
                  <div>
                    <p className="text-lg font-semibold">{insightsData.highestavgpackageratings[1].customname || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.highestavgpackageratings[2] ? `With a total of ${(insightsData.highestavgpackageratings[1].averageratings as number).toFixed(2)} ratings.` : "- No Data -"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>3.</p>
                  <div>
                    <p className="text-md font-semibold">{insightsData.highestavgpackageratings[2].customname || "- No Data -"}</p>
                    <p className="text-xs text-gray-600">{insightsData.highestavgpackageratings[2] ? `With a total of ${(insightsData.highestavgpackageratings[2].averageratings as number).toFixed(2)} ratings.` : "- No Data -"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}