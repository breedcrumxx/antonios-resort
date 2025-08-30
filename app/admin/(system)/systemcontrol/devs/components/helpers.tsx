'use client'

import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { UploadDatabaseBackup } from "@/app/components/ui/file-upload"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { useToast } from "@/app/components/ui/use-toast"
import CooldownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from "antd"
import { format } from "date-fns"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Helpers() {

  const { toast } = useToast()
  const router = useRouter()

  // states
  const [loading, setLoading] = useState<string>('')
  const [enableReset, setEnableReset] = useState<boolean>(false)
  const [allowReset, setAllowReset] = useState<boolean>(false)
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false)

  // data
  const [file, setFile] = useState<File | undefined>()

  const startReset = async () => {
    if (!file) {
      message.error("No file selected.")
      return
    }
    if (!allowReset) {
      setOpenWarningModal(true)
      return
    }

    let formData = new FormData()
    formData.append('file', file)

    setLoading("Resetting database, this might take a while...")
    const response = await fetch(`http://localhost:5000/reset`, {
      method: 'POST',
      body: formData,
    });
    setLoading("")

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to reset the system!",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Reset, you will temporarily logged out.",
      description: format(new Date(), "EEEE, MMMM d, yyyyy 'at' h:mm a")
    })

    setOpenWarningModal(false)

    signOut()
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl text-gray-500">Helpers</h1>
      <Separator />
      <div>
        <Label>Reset the system</Label>
        <p className="text-sm max-w-[50%]">Reset the system to its starting point, with initial data that is essential to running the system.</p>
      </div>
      <UploadDatabaseBackup
        className="w-[150px] h-[150px]"
        value={file}
        onChange={(f) => {
          setFile(f);
        }}
      />
      <p className="text-sm">Upload the starter zip file.</p>
      <br />
      <Button onClick={() => startReset()} variant={"destructive"} disabled={!enableReset}>Start reset</Button> <span className="text-red-500 text-sm ml-2">* Warning, for development only</span>
      <div className="flex items-center space-x-2">
        <Checkbox id="confirmReset" checked={enableReset} onCheckedChange={(e) => setEnableReset(e as boolean)} />
        <Label htmlFor="confirmReset" className="text-sm text-gray-700 max-w-[50%]">
          I understand that this action will reset the system, causing the loss of existing data and restoring the system to its initial state.
        </Label>
      </div>

      {
        openWarningModal && (
          <CooldownDialog
            open={openWarningModal}
            close={() => setOpenWarningModal(false)}
            title={"Restoring System Database to Default"}
            description={"This will reset the database to it's initial state. Database starters are applied to keep the system functioning. Continue?"}
            accept={() => {
              setAllowReset(true);
              startReset();
            }}
          />
        )
      }

      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </div>
  )
}