'use client'

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { usePackageData } from "@/app/providers/package-data-provider";
import { useCheckout } from "../../provider";
import clsx from "clsx";

export default function GuestCount() {

  // values
  const { guestCount, setGuestCount, toggleErrors } = useCheckout()
  const { packagedata } = usePackageData()

  return (
    <div>
      {
        packagedata && packagedata.type != 'event' && (
          <>
            <div>
              <Label htmlFor='adult'>Adult 20-above</Label>
              <Input
                id="adult"
                className={clsx("my-2 w-full sm:w-1/2", { "border-red-500": toggleErrors.count })}
                value={guestCount.adults}
                onChange={(e) => setGuestCount((prev) => ({ ...prev, adults: parseInt(e.target.value) }))}
                type="number"
                min={1}
                placeholder="Head count" />
            </div>
            {
              packagedata && packagedata.type != "cottage" ? (
                <>
                  <div>
                    <Label htmlFor='children'>Teens and kids (19 - below)</Label>
                    <Input
                      id="children"
                      className={clsx("my-2 w-full sm:w-1/2", { "border-red-500": toggleErrors.count })}
                      value={guestCount.teenkids}
                      onChange={(e) => setGuestCount((prev) => ({ ...prev, teenkids: parseInt(e.target.value) }))}
                      min={0}
                      max={10}
                      type="number"
                      placeholder="Head count" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor='teens'>Senior/PWD</Label>
                    <Input
                      id="teens"
                      className={clsx("my-2 w-full sm:w-1/2", { "border-red-500": toggleErrors.count })}
                      value={guestCount.seniorpwds}
                      onChange={(e) => setGuestCount((prev) => ({ ...prev, seniorpwds: parseInt(e.target.value) }))}
                      type="number"
                      min={0}
                      placeholder="Head count" />
                  </div>
                  <div>
                    <Label htmlFor='children'>Teens and kids (19 - below)</Label>
                    <Input
                      id="children"
                      className={clsx("my-2 w-full sm:w-1/2", { "border-red-500": toggleErrors.count })}
                      value={guestCount.teenkids}
                      onChange={(e) => setGuestCount((prev) => ({ ...prev, teenkids: parseInt(e.target.value) }))}
                      min={0}
                      max={10}
                      type="number"
                      placeholder="Head count" />
                  </div>
                  <div>
                    <Label htmlFor='children'>Birthday Celebrants</Label>
                    <Input
                      id="children"
                      className={clsx("my-2 w-full sm:w-1/2", { "border-red-500": toggleErrors.count })}
                      value={guestCount.celebrants}
                      onChange={(e) => setGuestCount((prev) => ({ ...prev, celebrants: parseInt(e.target.value) }))}
                      min={0}
                      max={10}
                      type="number"
                      placeholder="Head count" />
                  </div>
                  <p className="text-sm text-blue-500">For our public swimming and cottages entrance fees are not included in the booking. Entrance fees need to be paid upon check-in.</p>
                </>
              )
            }
          </>
        )
      }
    </div>
  )
}