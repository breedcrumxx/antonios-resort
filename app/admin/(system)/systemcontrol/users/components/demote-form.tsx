'use client'

import { useToast } from "@/app/components/ui/use-toast"
import { updateUserRole } from "@/lib/actions/account-actions/update-user-role"
import { defaultprofile } from "@/lib/configs/config-file"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { user } from "@/lib/zod/z-schema"
import { format } from "date-fns"
import Image from 'next/image'
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import z from 'zod'

export default function DemoteToClient({ selectedUser, currentUser, close }: { selectedUser: z.infer<typeof user>, currentUser: UserSession | null, close: () => void }) {

  const router = useRouter()
  const pathname = usePathname()

  if (!currentUser) {
    router.push(`/signin?callbackUrl=${pathname}`)
    return
  }

  const { toast } = useToast()

  // states 
  const [loading, setLoading] = useState<boolean>(false)

  if (selectedUser.role.role == "Client") {
    return (
      <CoolDownDialog
        open={true}
        close={close}
        title="Reset User Role"
        description="This user is already a client, perhaps you're mistaken?"
        accept={() => { }}
        proceedstyle="bg-green-500"
        cooldown={5}
        fallback
      />
    )
  }

  const handleDemoteUser = async () => {
    setLoading(true)

    if (selectedUser.role.role == "Client") {
      setLoading(false)
      close()
      toast({
        title: 'Demoted successfully!',
        description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
      })
      return
    }

    const response = await updateUserRole(selectedUser.id, "", "Client")
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: 'An error occured!',
        description: "Unable to demote a user.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: 'Demoted successfully!',
      description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
    })
    close()
  }

  const content = (
    <div className="flex justify-center py-6">
      <div className="flex items-center gap-2">
        <div className="bg-gray-300 h-[50px] w-[50px] rounded-[100px] relative overflow-hidden">
          <Image
            fill
            src={selectedUser.image || defaultprofile}
            alt="user-profile"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{selectedUser.email}</p>
          <p className="capitalize text-sm">{selectedUser.firstname + " " + selectedUser.lastname}</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <CoolDownDialog
        open={true}
        close={close}
        title="Reset User Role"
        description="You are about to give this user with previously high system-access a client role. Are you sure?"
        body={content}
        accept={() => handleDemoteUser()}
        cooldown={5}
        isContent
      />
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Updating role, please wait..." />
    </>
  )
}