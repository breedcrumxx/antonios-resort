import { Button } from "@/app/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { deleteDefaultSchedule } from "@/lib/actions/schedule-actions/schedule-actions"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useState } from "react"

export default function DeleteSchedule({ scheduleid, close }:
  {
    scheduleid: string,
    close: () => void,
  }) {


  const { setReload } = useReload()
  const { toast } = useToast()

  // states
  const [loading, setLoading] = useState(false)

  const deleteRecord = async () => {
    setLoading(true)

    const response = await deleteDefaultSchedule(scheduleid)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "Unable to delete the record!",
        description: "An error ocurred while attempting to delete the record.",
        variant: "destructive"
      })

      return
    }

    toast({
      title: "Deleted successfully.",
      description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    })

    setReload(true)
    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex text-red-500 gap-2 items-center">
          <ExclamationTriangleIcon className="w-6 h-6" />
          Are you sure?
        </DialogTitle>
        <DialogDescription>
          You will not have a default suggestion for this type when creating a package, continue?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant={"outline"} onClick={() => close()}>Cancel</Button>
        <Button variant={"destructive"} onClick={() => deleteRecord()}>Delete</Button>
      </DialogFooter>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Deleting default schedule, please wait..." />
    </>
  )
}