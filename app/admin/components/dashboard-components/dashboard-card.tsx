import { Card, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import clsx from "clsx";

export default async function DashboardCard({ text, icon, value, callback, stats, titleclass }:
  {
    text: string,
    icon: JSX.Element,
    value: boolean,
    callback: () => Promise<any>,
    stats?: () => Promise<any>,
    titleclass?: string
  }) {

  try {

    let { status, data } = await callback()
    let statsFargment: any = null
    let statsval = 0

    if (stats != undefined) {
      let { status: statsStatus, data: statsData } = await stats()
      if (statsStatus == 200) {
        statsval = statsData
        const diff = (data - statsData)
        const percentageDiff = (diff / statsData) * 100

        statsFargment = (
          <div>
            <p className="text-gray-500/70"><span className={clsx("text-green-500", { "text-red-500": percentageDiff < 0 })}>{statsData > 0 ? percentageDiff.toFixed(2) + "%" : "+ 100%"}</span> than last month</p>
          </div>
        )
      }

    }

    if (status == 500) {
      throw new Error()
    }

    return (
      <Card className="h-full">
        <CardHeader className="h-full flex justify-center">
          <CardTitle className="flex gap-2 items-end">
            {icon}
            {value ? (
              <span className={cn(titleclass)}>&#8369; {(data).toLocaleString()}</span>
            ) : (
              <span>{(data).toLocaleString()}</span>
            )}
            {
              statsval > 0 && (
                <>
                  {value ? (
                    <span className="opacity-40 text-sm">&#8369; {(statsval).toLocaleString()}</span>
                  ) : (
                    <span className="opacity-40 text-sm">{(statsval).toLocaleString()}</span>
                  )}
                </>
              )
            }
          </CardTitle>
          <CardDescription className="text-md">{text}</CardDescription>
          {statsFargment}
        </CardHeader>
      </Card>
    )
  } catch (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-md flex gap-5">
            {icon}
            <p className="text-red-500">
              Error
            </p>
          </CardTitle>
          <CardDescription className="text-md">{text}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

}