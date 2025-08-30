'use client'

import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { abortSystemMaintenance } from "@/lib/actions/system-actions/system-maintenance"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { format } from "date-fns"
import { useState } from "react"
import { z } from "zod"

export default function AbortMaintenance({ data, close }: { data: z.infer<typeof maintenanceschema>, close: () => void }) {

  // context
  const { toast } = useToast()
  const { setReload } = useReload()

  // state 
  const [loading, setLoading] = useState<boolean>(false)

  const AbortMaintenance = async () => {
    setLoading(true)
    const response = await abortSystemMaintenance(data.id)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to abort the current maintenance, please try again later!",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Aborted the maintenance!",
      description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`
    })
    close()
    setReload(true)
  }

  return (
    <>
      <CoolDownDialog
        open={true}
        close={close}
        title={"Abort the maintenance"}
        description={"Are you sure to abort the current selected maintenance?"}
        accept={AbortMaintenance}
        isContent
        cancel={"No"}
        proceed={"Proceed to abort"}
      />
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Aborting maintenance, please wait..." />
    </>
  )
}