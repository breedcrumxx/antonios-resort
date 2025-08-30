'use client'

import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { usePackageData } from "@/app/providers/package-data-provider"
import { removePackage } from "@/lib/actions/custompackage-actions/package-actions"
import CooldownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PackageControls() {

  const router = useRouter()
  const { packagedata } = usePackageData()

  router.prefetch(`/custom?id=${packagedata?.id}`)

  // state
  const [loading, setLoading] = useState<boolean>(false)
  const [openReminder, setOpenReminder] = useState<boolean>(false)

  const deletePackage = async () => {
    if (!packagedata) {
      message.error("Cannot find the package!")
      return
    }
    setLoading(true)
    const response = await removePackage(packagedata.id)
    setLoading(false)

    if (response.status == 500) {
      message.error("Unable to delete a package, please try again later!")
      return
    }

    message.success("Package deleted!")
    router.push("/package")
  }

  return (
    <>
      <Separator className="hidden sm:block" />
      <Button
        className="w-full hidden sm:block"
        variant={"outline"}
        onClick={() => router.push(`/custom?id=${packagedata?.id}`)} disabled={!packagedata}>Edit package</Button>
      <Button
        className="w-full hidden sm:block"
        variant={"destructive"}
        onClick={() => setOpenReminder(true)}>Delete</Button>

      {
        openReminder && (
          <CooldownDialog
            open={openReminder}
            close={() => setOpenReminder(false)}
            title="Deleting a Package"
            description="Deleting this package will make it unavailable for future bookings. However, any existing bookings that include this package will remain unaffected. Do you wish to proceed?"
            accept={() => deletePackage()}
            cooldown={5}
          />
        )
      }

      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Processing, please wait..." />
    </>
  )
}