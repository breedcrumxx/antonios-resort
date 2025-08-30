'use client'

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { rateStatementGenerator } from "@/lib/actions/booking-actions/rate-statement-gen";
import { extendedpackageoffer } from "@/lib/zod/z-schema";
import { Badge as AntBadge, Rate } from 'antd';
import clsx from "clsx";
import { add } from "date-fns";
import moment from "moment";
import { useRouter } from "next/navigation";
import z from 'zod';

export default function PackageCard({
  data,
  onScan,
  handleUpgrade,
  slot,
}: {
  data: z.infer<typeof extendedpackageoffer>,
  user?: UserSession | null,
  onScan?: boolean,
  handleUpgrade?: (item: z.infer<typeof extendedpackageoffer>) => void,
  slot?: string,
}) {

  const router = useRouter()

  router.prefetch(`/package/${data.id}`)

  const handleViewPackage = () => {

    const stringpackage = JSON.stringify(data)
    sessionStorage.setItem('package', stringpackage)

    router.push(`/package/${data.id}`)
  }

  return (
    <>
      <AntBadge.Ribbon
        color="red"
        className="text-"
        text={<p><span className="text-lg">{data.quantity - data.bookingcount} </span>slot/s left</p>}
      >
        <Card className="w-full p-2 cursor-pointer hover:bg-muted hover:shadow-lg">
          <CardContent className="w-full min-h-[100px] sm:flex gap-2 p-0 rounded-lg relative sm:h-[250px]">
            <div className="w-full h-[250px] sm:h-auto sm:min-w-[30%] sm:max-w-[30%] grid grid-cols-3 grid-rows-3 gap-1">
              <div className="flex items-center justify-center col-span-3 row-span-2 bg-gray-300 overflow-hidden relative">
                <img
                  src={data.images[0]}
                  alt="preview-image"
                  className="object-cover aspect-auto w-full h-full"
                />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <img
                  src={data.images[1]}
                  alt="preview-image"
                  className="object-cover aspect-auto w-full h-full"
                />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <img
                  src={data.images[2]}
                  alt="preview-image"
                  className="object-cover aspect-auto w-full h-full"
                />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <img
                  src={data.images[3]}
                  alt="preview-image"
                  className="object-cover aspect-auto w-full h-full"
                />
              </div>
            </div>

            <div className="flex-grow block sm:flex">
              <div className="w-full sm:w-4/6 h-full flex flex-col p-2">
                <p className="font-bold">{data.packagename}</p>
                <div className="flex gap-2">
                  <Rate allowHalf value={data.avgratings} disabled />
                  <p className="text-md">- {data.ratingcount} reviews</p>
                </div>

                <Separator className="my-2" />
                <div className="text-sm">
                  {
                    data.type == "villa" && (
                      <>
                        {
                          data.day_tour.status && data.night_tour.status ? (
                            <>
                              <p className="font-semibold">Day and night tour available!</p>
                            </>
                          ) : (
                            <p className="font-semibold">{data.day_tour.status ? "Day tour available!" : data.night_tour.status && "Night tour available!"}</p>
                          )
                        }
                        {data.day_tour.status && <p>Day tour: check-in {moment(data.day_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.day_tour.timein, 'HH:mm:ss').toString(), { hours: data.day_tour.duration })).format('hh:mm a')}</p>}
                        {data.night_tour && <p>Night tour: check-in {moment(data.night_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.night_tour.timein, 'HH:mm:ss').toString(), { hours: data.night_tour.duration })).format('hh:mm a')}</p>}
                      </>
                    )
                  }
                  {
                    data.type == "cottage" && (
                      <>
                        <p className="font-semibold">Regular rates available!</p>
                        <p>Available from {moment(data.regular_stay.timein, 'HH:mm:ss').format('hh:mm a')} to {moment(data.regular_stay.timeout, 'HH:mm:ss').format('hh:mm a')}</p>
                      </>
                    )
                  }
                  {
                    data.type == "event" && (
                      <>
                        {
                          data.day_tour.status && data.night_tour.status ? (
                            <>
                              <p className="font-semibold">Day and night event available!</p>
                            </>
                          ) : (
                            <p className="font-semibold">{data.day_tour.status ? "Day event available!" : data.night_tour.status && "Night event available!"}</p>
                          )
                        }
                        {data.day_tour.status && <p>Day event from {moment(data.day_tour.timein, 'HH:mm:ss').format('hh:mm a')}  up to {moment(data.day_tour.timeout, 'HH:mm:ss').format('hh:mm a')}</p>}
                        {data.night_tour.status && <p>Night event from {moment(data.night_tour.timein, 'HH:mm:ss').format('hh:mm a')}  up to {moment(data.night_tour.timeout, 'HH:mm:ss').format('hh:mm a')}</p>}
                      </>
                    )
                  }
                  {/* {
                    data.type != "cottage" ? (
                      <>
                        {
                          data.day_tour.status && data.night_tour.status ? (
                            <>
                              <p className="font-semibold">Day and night tour available!</p>
                              {
                                data.type == "villa" ? (
                                  <>
                                    <p>Day tour: check-in {moment(data.day_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.day_tour.timein, 'HH:mm:ss').toString(), { hours: data.day_tour.duration })).format('hh:mm a')}</p>
                                    <p>Night tour: check-in {moment(data.night_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.night_tour.timein, 'HH:mm:ss').toString(), { hours: data.night_tour.duration })).format('hh:mm a')}</p>
                                  </>
                                ) : null
                              }
                            </>
                          ) : (
                            <>
                              {
                                data.day_tour.status ? (
                                  <>
                                    <p className="font-semibold">Day tour available!</p>
                                    <p>Day tour: check-in {moment(data.day_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.day_tour.timein, 'HH:mm:ss').toString(), { hours: data.day_tour.duration })).format('hh:mm a')}</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-semibold">Night tour available!</p>
                                    <p>Night tour: check-in {moment(data.day_tour.timein, 'HH:mm:ss').format('hh:mm a')}  check-out {moment(add(moment(data.day_tour.timein, 'HH:mm:ss').toString(), { hours: data.day_tour.duration })).format('hh:mm a')}</p>
                                  </>
                                )
                              }</>
                          )
                        }
                      </>
                    ) : (
                      <p>Regular rates available!</p>
                    )
                  } */}
                </div>
                <div>
                  <p className="text-sm py-1">Package offers:</p>
                  <div className="flex flex-wrap gap-1">
                    {
                      data.inclusion
                        .filter((item) => item.length <= 20)
                        .sort((a, b) => a.length - b.length)
                        .slice(0, 5).map((service, i: number) => {
                          if (i >= 5) {
                            return null
                          }
                          return (
                            <Badge key={i}>{service}</Badge>
                          )
                        })
                    }
                    {
                      data.inclusion.length - 5 > 0 && (
                        <Badge>{data.inclusion.length - 5} +</Badge>
                      )
                    }
                  </div>
                </div>
              </div>

              <br className="block sm:hidden" />
              <div className="font-semibold text-right text-4xl block sm:hidden">
                <p className={clsx("opacity-0 text-lg", { "opacity-100 text-right line-through": data.discount > 0 })}>
                  {
                    !onScan && (
                      <>
                        { // show the lowest price
                          data.type != "cottage" ? (
                            <>
                              {
                                data.day_tour.price < data.night_tour.price ? (
                                  <>{data.day_tour.price.toLocaleString()}</>
                                ) : (
                                  <>{data.night_tour.price.toLocaleString()}</>
                                )
                              }
                            </>
                          ) : (
                            <>{data.regular_stay.price.toLocaleString()}</>
                          )
                        }
                      </>
                    )
                  }
                </p>

                <p className={clsx("text-black", { "text-red-500": data.discount > 0 })}><span className={clsx("font-normal text-black text-lg", {
                  "hidden": onScan
                })}>Price starts at</span> &#8369;
                  {
                    !onScan && (
                      <>
                        {
                          data.type != "cottage" ? (
                            <>
                              { // show the lowest price
                                data.day_tour.price < data.night_tour.price ? (
                                  <>{(data.day_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}</>
                                ) : (
                                  <>{(data.night_tour.price - (data.night_tour.price * (data.discount / 100))).toLocaleString()}</>
                                )
                              }
                            </>
                          ) : (
                            <>
                              {(data.regular_stay.price - (data.regular_stay.price * (data.discount / 100))).toLocaleString()}
                            </>
                          )
                        }
                      </>
                    )
                  }
                  {
                    onScan && (
                      <>
                        {
                          slot == "day" ? (
                            <>
                              {(data.day_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                            </>
                          ) : slot == "night" ? (
                            <>
                              {(data.night_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                            </>
                          ) : slot == "regular" && (
                            <>
                              {(data.night_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                            </>
                          )
                        }
                      </>
                    )
                  }
                </p>
              </div>
              <AntBadge.Ribbon
                className={clsx("text-md sm:hidden", { "hidden": data.bookingcount < data.quantity })}
                color="red"
                text="FULLY BOOKED!">
                {
                  !onScan ? (
                    <Button
                      className="w-full py-2 bg-prm block sm:hidden"
                      onClick={() => handleViewPackage()}
                      disabled={data.bookingcount >= data.quantity}
                    >Book</Button>
                  ) : (
                    <AntBadge.Ribbon
                      text="Slot unavailable"
                      color="red"
                      className={clsx("hidden", {
                        "block sm:hidden": (slot == "day" && !data.day_tour.status) || (slot == "night" && !data.night_tour.status),
                      })}
                    >
                      <Button
                        className="w-full py-2 bg-prm block sm:hidden"
                        onClick={() => handleUpgrade?.(data)}
                        disabled={data.bookingcount >= data.quantity}
                      >Upgrade</Button>
                    </AntBadge.Ribbon>
                  )
                }
              </AntBadge.Ribbon>

              <div className="hidden sm:block sm:w-2/6 h-auto sm:flex sm:flex-col py-2 pl-2 border-l-[1px]">
                <div className="mt-5">
                  <p className="text-right font-semibold">{data.avgratings ? (<span>{(data.avgratings || 0).toFixed(2)} {rateStatementGenerator(data.avgratings)}</span>) : "No ratings yet"}</p>
                  <p className="text-right text-sm">{data.ratingcount} reviews</p>
                </div>
                <div className="flex-grow"></div>

                <div className="font-semibold text-right text-lg">
                  <p className={clsx("opacity-0", { "opacity-100 text-right line-through text-sm": data.discount > 0 })}>
                    {
                      !onScan && (
                        <>
                          { // show the lowest price
                            data.type != "cottage" ? (
                              <>
                                {
                                  data.day_tour.price < data.night_tour.price ? (
                                    <>{data.day_tour.price.toLocaleString()}</>
                                  ) : (
                                    <>{data.night_tour.price.toLocaleString()}</>
                                  )
                                }
                              </>
                            ) : (
                              <>{data.regular_stay.price.toLocaleString()}</>
                            )
                          }
                        </>
                      )
                    }
                  </p>

                  <p className={clsx("text-black", { "text-red-500": data.discount > 0 })}><span className={clsx("font-normal text-black text-xs", {
                    "hidden": onScan
                  })}>Price starts at</span> &#8369;
                    {
                      !onScan && (
                        <>
                          {
                            data.type != "cottage" ? (
                              <>
                                { // show the lowest price
                                  data.day_tour.price < data.night_tour.price ? (
                                    <>{(data.day_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}</>
                                  ) : (
                                    <>{(data.night_tour.price - (data.night_tour.price * (data.discount / 100))).toLocaleString()}</>
                                  )
                                }
                              </>
                            ) : (
                              <>
                                {(data.regular_stay.price - (data.regular_stay.price * (data.discount / 100))).toLocaleString()}
                              </>
                            )
                          }
                        </>
                      )
                    }
                    {
                      onScan && (
                        <>
                          {
                            slot == "day" ? (
                              <>
                                {(data.day_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                              </>
                            ) : slot == "night" ? (
                              <>
                                {(data.night_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                              </>
                            ) : slot == "regular" && (
                              <>
                                {(data.night_tour.price - (data.day_tour.price * (data.discount / 100))).toLocaleString()}
                              </>
                            )
                          }
                        </>
                      )
                    }
                  </p>
                </div>

                <AntBadge.Ribbon
                  className={clsx("text-md", { "hidden": data.bookingcount < data.quantity })}
                  color="red"
                  text="FULLY BOOKED!">
                  {
                    !onScan ? (
                      <Button
                        className="w-full py-2 bg-prm"
                        onClick={() => handleViewPackage()}
                        disabled={data.bookingcount >= data.quantity}
                      >Book</Button>
                    ) : (
                      <AntBadge.Ribbon
                        text="Slot unavailable"
                        color="red"
                        className={clsx("hidden", {
                          "block": (slot == "day" && !data.day_tour.status) || (slot == "night" && !data.night_tour.status),
                        })}
                      >
                        <Button
                          className="w-full py-2 bg-prm"
                          onClick={() => handleUpgrade?.(data)}
                          disabled={data.bookingcount >= data.quantity}
                        >Upgrade</Button>
                      </AntBadge.Ribbon>
                    )
                  }
                </AntBadge.Ribbon>
                <p className="text-xs">All fees, taxes, and package discount are already applied.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AntBadge.Ribbon>
    </>
  )
}