'use client'

import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { Switch } from "@/app/components/ui/switch"
import { useToast } from "@/app/components/ui/use-toast"
import { useDevs } from "@/app/providers/dev-configuration-provider"
import { DevsConfigType } from "@/lib/configs/config-file"
import { loadConfig } from "@/lib/configs/load-config"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DevOptions() {
  const { dev } = useDevs()
  const { toast } = useToast()
  const router = useRouter()

  // states
  const [loading, setLoading] = useState<string>('')

  // values
  const [config, setConfig] = useState<DevsConfigType>(dev)

  const handleUpdateDevs = async () => {
    setLoading("Saving changes, please wait...")

    const response = await loadConfig("devs", JSON.stringify(config), true)
    setLoading("")

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to update the developers configuration!",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Updated, please reload the browser.",
      description: format(new Date(), "EEEE, MMMM d, yyyyy 'at' h:mm a")
    })

  }


  return (
    <div className="space-y-2 my-10">
      <h1 className="font-semibold text-2xl text-gray-500">Developers options</h1>
      <Separator />
      <h1 className="font-semibold text-gray-500">Debugging options</h1>
      <div className="flex gap-4 items-center">
        <Switch checked={config.DEBUG} onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, DEBUG: e }))} />
        <Label>Enable debugging</Label> <span className="text-red-500 text-sm ml-2">* Warning, for development only</span>
      </div>
      <p className="text-sm max-w-[50%]">This debugging configuration provides granular control over various aspects of the application&apos;s functionality. It allows developers to enable or disable specific features like OTP, session management during scanning, sign-in procedures, rescheduling options, and checkout processes. By adjusting these flags, developers can simulate different scenarios and behaviors within the app to test and troubleshoot specific workflows.</p>

      <br />
      <div className="flex gap-4 items-center">
        <Switch checked={config.otp} onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, otp: e }))}
          disabled={!config.DEBUG}
        />
        <Label>OTP on console</Label>
      </div>
      <p className="text-sm max-w-[50%]">Show OTP on console for faster debugging.</p>

      <br />
      <h1 className="font-semibold text-gray-500">Scan page</h1>
      <div className="flex gap-4 items-center">
        <Switch
          checked={config.scan.allowunscheduled}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, scan: { ...prev.scan, allowunscheduled: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Allow unscheduled</Label>
      </div>
      <p className="text-sm max-w-[50%]">Disable system constraints when checking-in a booking.</p>

      <div className="flex gap-4 items-center">
        <Switch
          checked={config.scan.allowstart}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, scan: { ...prev.scan, allowstart: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Allow Booking Start</Label>
      </div>
      <p className="text-sm max-w-[50%]">Disable system constraints when proceeding to check-in.</p>

      <div className="flex gap-4 items-center">
        <Switch
          checked={config.scan.allowend}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, scan: { ...prev.scan, allowend: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Allow Booking End</Label>
      </div>
      <p className="text-sm max-w-[50%]">Disable system constraints when ending a booking session.</p>

      <br />
      <h1 className="font-semibold text-gray-500">Reschedule page</h1>
      <div className="flex gap-4 items-center">
        <Switch
          checked={config.reschedule.allow}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, reschedule: { ...prev.reschedule, allow: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Reschedule: Allow access</Label>
      </div>
      <p className="text-sm max-w-[50%]">Allow access on reschedule page.</p>

      <div className="flex gap-4 items-center">
        <Switch
          checked={config.reschedule.freedate}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, reschedule: { ...prev.reschedule, freedate: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Reschedule: NO DATE RESTRICTION</Label>
      </div>
      <p className="text-sm max-w-[50%]">Disable most restrictions on date selection.</p>

      <br />
      <h1 className="font-semibold text-gray-500">Checkout page</h1>
      <div className="flex gap-4 items-center">
        <Switch
          checked={config.checkout.freedate}
          onCheckedChange={(e: boolean) => setConfig((prev) => ({ ...prev, checkout: { ...prev.checkout, freedate: e } }))}
          disabled={!config.DEBUG}
        />
        <Label>Checkout: NO DATE RESTRICTION</Label>
      </div>
      <p className="text-sm max-w-[50%]">Disable most restrictions on date selection.</p>

      <br />
      <Button
        onClick={() => handleUpdateDevs()}
      >Save developers options</Button>

      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </div>
  )
}