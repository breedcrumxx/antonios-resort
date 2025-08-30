'use client'

import { Button } from "@/app/components/ui/button"
import { DialogFooter } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useToast } from "@/app/components/ui/use-toast"
import { updateUserRole } from "@/lib/actions/account-actions/update-user-role"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { useFetch } from "@/lib/utils/use-fetch"
import { role, user } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { z } from "zod"
import SearchUserCore from "./search-user-core"
import { useReload } from "@/app/providers/reloader"
import VerifyPasswordModal from "./verify-password-modal"

export default function AddMemberForm({ currentUser, close, passedvalue }: { currentUser: UserSession, close: () => void, passedvalue?: z.infer<typeof user> }) {

  const { setReload } = useReload()
  const { data: roles, loading: fetching, error } = useFetch<z.infer<typeof role>[]>("/api/users/roles")
  const { toast } = useToast()

  // states
  const [result, showResult] = useState<boolean>(false)
  const [reminder, setReminder] = useState<boolean>(false)
  const [openPasswordPrompt, setOpenPasswordPrompt] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [agreed, setAgreed] = useState<boolean>(false)
  const [allow, setAllow] = useState<boolean>(false)

  // values
  const [selectedUser, setSelectedUser] = useState<z.infer<typeof user> | null>(passedvalue ? passedvalue : null)
  const [newRole, setNewRole] = useState<string>(passedvalue ? passedvalue.role.id : "")

  useEffect(() => {
    if (allow) {
      assignNewRole()
    }
  }, [allow])

  const assignNewRole = async () => {
    if (!allow) {
      setOpenPasswordPrompt(true)
      return
    }

    setLoading(true)

    if (!selectedUser) {
      message.error("Unable to update user role!")
      setLoading(false)
      return
    }

    if (selectedUser.role.id == newRole) {
      setLoading(false)
      toast({
        title: "Role updated!",
        description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`
      })
      close()
      return
    }

    const response = await updateUserRole(selectedUser.id, newRole)
    setLoading(false)

    if (response.status == 500) {
      toast({
        title: "An error occured!",
        description: "Unable to update user's role, please try again later!",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Update user's role!",
      description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`
    })
    setReload(true)
    close()
  }

  return (
    <>
      {
        selectedUser?.id == currentUser.id && (
          <p className="text-red-500 text-sm">You are not allowed to change your own role.</p>
        )
      }
      <div className="space-y-4">
        <div>
          <Label htmlFor="user-email">User</Label>
          <Input id="user-email" placeholder="@email..." onClick={(e) => showResult(true)} readOnly={true} value={selectedUser ? selectedUser.email : ""} />
        </div>
        <div>
          <Label htmlFor="user-role">Role</Label>
          <Select value={newRole} onValueChange={(e) => setNewRole(e)} disabled={fetching || error || (selectedUser?.id == currentUser.id)}>
            <SelectTrigger className="">
              {
                fetching ? (
                  <Spinner size="sm" />
                ) : error ? (
                  <p className="text-red-500 text-sm opacity-70">Unable to get roles...</p>
                ) : (
                  <SelectValue placeholder="Assign a role" />
                )
              }
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                {
                  roles && roles.map((item, i) => (
                    <SelectItem key={i} value={item.id}>{item.role}</SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => assignNewRole()} disabled={newRole.length == 0}>Assign new role</Button>
      </DialogFooter>
      <SearchUserCore open={result} close={() => showResult(false)} setuser={(selected: z.infer<typeof user>) => {
        setSelectedUser(selected)
        setNewRole(selected.role.id)
      }} />

      <VerifyPasswordModal
        open={openPasswordPrompt}
        close={() => setOpenPasswordPrompt(false)}
        setAllow={(value: boolean) => setAllow(value)}
        email={currentUser.email}
      />

      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Assigning new role, please wait..." />
    </>
  )
}