'use client'

import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Separator } from "@/app/components/ui/separator"
import { Textarea } from "@/app/components/ui/textarea"
import { useCustomPackage } from "../provider"
import clsx from "clsx"

export default function BaseInfoEditor() {

  // context
  const {
    packageDescription,
    setPackageDescription,
    packageName,
    setPackageName,
    packageType,
    setPackageType,
    setMaxPax,
    maxPax,
    maxQuantity,
    setMaxQuantity,
    schedules,
    setSchedules,
  } = useCustomPackage()

  // console.log(packageType)

  const handleChangeType = (e: string) => {
    if (e == "cottage") {
      setSchedules((prev) => ({
        day: { ...prev.day, status: false },
        night: { ...prev.night, status: false },
        regular: { ...prev.regular, status: true }
      }))
    } else {
      setSchedules((prev) => ({
        day: { ...prev.day, status: true },
        night: { ...prev.night, status: true },
        regular: { ...prev.regular, status: false }
      }))
    }

    setPackageType(e)
  }

  const handleToggleSlots = (e: boolean, from: "night" | "day") => {
    if (from == "night") {
      if (e) { // on
        setSchedules((prev) => ({ ...prev, night: { ...prev.night, status: e as boolean } }))
        return
      }
      // off
      if (!schedules.day.status) { // check if day is off
        // toggle day to on and toggle night to off
        setSchedules((prev) => ({ ...prev, day: { ...prev.day, status: true }, night: { ...prev.night, status: false } }))
      } else { // day is on
        // toggle night to off
        setSchedules((prev) => ({ ...prev, night: { ...prev.night, status: false } }))
      }
    } else { // day
      if (e) { // on
        setSchedules((prev) => ({ ...prev, day: { ...prev.day, status: e as boolean } }))
        return
      }

      if (!schedules.night.status) { // check if night is off
        // toggle night to on and toggle day to off
        setSchedules((prev) => ({ ...prev, day: { ...prev.day, status: false }, night: { ...prev.night, status: true } }))
      } else { // night is on
        // toggle day to off
        setSchedules((prev) => ({ ...prev, day: { ...prev.day, status: false } }))
      }

      // off
    }
  }

  return (
    <>
      <div className="w-full flex flex-col p-2 bg-white">
        <div className="w-full relative">
          <Input
            className="text-xl font-semibold bg-transparent border-none"
            placeholder="package name..."
            onChange={(e) => setPackageName(e.target.value)}
            value={packageName}
            required
          />
        </div>
        <Separator />
        <div className="flex-grow relative">
          <Textarea
            className="bg-transparent border-none resize-none"
            placeholder="Give a short description for this package to inform your guest."
            onChange={(e) => setPackageDescription(e.target.value)}
            value={packageDescription}
            required
          />
        </div>
        <div className="w-full grid grid-cols-3 gap-4 px-4 py-4 text-sm whitespace-nowrap">
          <div>
            <p className="font-semibold">Type:</p>
            <Select defaultValue={packageType} onValueChange={(e) => handleChangeType(e)} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="villa">VILLA</SelectItem>
                  <SelectItem value="event">EVENT CENTER</SelectItem>
                  <SelectItem value="cottage">COTTAGE</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="font-semibold">Max pax:</p>
            <Input
              value={maxPax}
              onChange={(e) => setMaxPax(parseInt(e.target.value))}
              type="number"
              min={2}
              placeholder="0"
              disabled={packageType.length == 0} />
          </div>
          <div>
            <p className="font-semibold">Max slot:</p>
            <Input
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(parseInt(e.target.value))}
              type="number"
              min={1}
              placeholder="0"
              disabled={packageType.length == 0} />
          </div>
        </div>

        {
          packageType.length > 0 && packageType != "cottage" ? (
            <>
              <div className="px-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="daytour" checked={schedules.day.status} onCheckedChange={(e) => handleToggleSlots(e as boolean, "day")} />
                  <Label htmlFor="daytour" className="font-semibold">Day tour</Label>
                </div>
                <p className="text-sm text-gray-500">Customize this package day tour schedule.</p>
                {
                  schedules.day.status ? (
                    <div className={clsx("w-full grid gap-4 px-4 py-4 text-sm whitespace-nowrap", {
                      "grid-cols-4": packageType == "event",
                      "grid-cols-3": packageType != "event",
                    })}>
                      <div className="">
                        <p className="font-semibold">{packageType == "event" ? "From" : "Check-in"}</p>
                        <Input
                          value={schedules.day.timein}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, day: { ...prev.day, timein: e.target.value } }))}
                          className="w-full"
                          type="time"
                          required
                        />
                      </div>
                      {
                        packageType == "event" && (
                          <div className="">
                            <p className="font-semibold">{packageType == "event" ? "To" : "Check-out"}</p>
                            <Input
                              value={schedules.day.timeout}
                              onChange={(e) => setSchedules((prev) => ({ ...prev, day: { ...prev.day, timeout: e.target.value } }))}
                              className="w-full"
                              type="time"
                              required
                            />
                          </div>
                        )
                      }
                      <div>
                        <p className="font-semibold">Duration:</p>
                        <Input
                          value={schedules.day.duration}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, day: { ...prev.day, duration: parseInt(e.target.value) } }))}
                          className="w-full"
                          type="number"
                          min={5}
                          disabled={!schedules.day.status}
                          placeholder="5 hrs" />
                      </div>
                      <div>
                        <p className="font-semibold">Price:</p>
                        <Input
                          className="w-full"
                          value={schedules.day.price}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, day: { ...prev.day, price: parseInt(e.target.value) } }))}
                          type="number"
                          disabled={!schedules.day.status}
                          min={1000}
                          placeholder="price" />
                      </div>
                    </div>
                  ) : (
                    <br />
                  )
                }
              </div>

              <div className="px-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="nighttour" checked={schedules.night.status} onCheckedChange={(e) => handleToggleSlots(e as boolean, "night")} />
                  <Label htmlFor="nighttour" className="font-semibold">Night tour</Label>
                </div>
                <p className="text-sm text-gray-500">Customize this package day tour schedule.</p>
                {
                  schedules.night.status ? (
                    <div className={clsx("w-full grid gap-4 px-4 py-4 text-sm whitespace-nowrap", {
                      "grid-cols-4": packageType == "event",
                      "grid-cols-3": packageType != "event",
                    })}>
                      <div className="">
                        <p className="font-semibold">{packageType == "event" ? "From" : "Check-in"}</p>
                        <Input
                          className="w-full"
                          value={schedules.night.timein}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, night: { ...prev.night, timein: e.target.value } }))}
                          type="time"
                          required
                        />
                      </div>
                      {
                        packageType == "event" && (
                          <div className="">
                            <p className="font-semibold">{packageType == "event" ? "To" : "Check-out"}</p>
                            <Input
                              className="w-full"
                              value={schedules.night.timeout}
                              onChange={(e) => setSchedules((prev) => ({ ...prev, night: { ...prev.night, timeout: e.target.value } }))}
                              type="time"
                              required
                            />
                          </div>
                        )
                      }
                      <div>
                        <p className="font-semibold">Duration:</p>
                        <Input
                          className="w-full"
                          value={schedules.night.duration}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, night: { ...prev.night, duration: parseInt(e.target.value) } }))}
                          type="number"
                          min={5}
                          required
                          placeholder="5 hrs"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Price:</p>
                        <Input
                          className="w-full"
                          value={schedules.night.price}
                          onChange={(e) => setSchedules((prev) => ({ ...prev, night: { ...prev.night, price: parseInt(e.target.value) } }))}
                          type="number"
                          required
                          min={1000}
                          placeholder="price" />
                      </div>
                    </div>
                  ) : (
                    <br />
                  )
                }
              </div>
            </>
          ) : packageType.length > 0 ? (
            <div className="w-full grid grid-cols-3 gap-4 px-4 py-4 text-sm whitespace-nowrap">
              <div className="">
                <p className="font-semibold">Check-in:</p>
                <Input
                  value={schedules.regular.timein}
                  onChange={(e) => setSchedules((prev) => ({ ...prev, regular: { ...prev.regular, timein: e.target.value } }))}
                  className="w-full"
                  type="time"
                />
              </div>
              <div>
                <p className="font-semibold">Check-out:</p>
                <Input
                  value={schedules.regular.timeout}
                  onChange={(e) => setSchedules((prev) => ({ ...prev, regular: { ...prev.regular, timeout: e.target.value } }))}
                  className="w-full"
                  type="time"
                  required
                />
              </div>
              <div>
                <p className="font-semibold">Price:</p>
                <Input
                  className="w-full"
                  type="number"
                  value={schedules.regular.price}
                  onChange={(e) => setSchedules((prev) => ({ ...prev, regular: { ...prev.regular, price: parseFloat(e.target.value) } }))}
                  min={100}
                  required
                  placeholder="price" />
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-sm py-10">Please select a package type...</p>
            </>
          )
        }
      </div>
    </>
  )
}