'use client'

import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { useToast } from "@/app/components/ui/use-toast"
import { useReload } from "@/app/providers/reloader"
import { blockAUser, unblockAUser } from "@/lib/actions/account-actions/block-user"
import { resetUserPassword } from "@/lib/actions/account-actions/reset-user-password"
import CoolDownDialog from "@/lib/utils/cooldown-dialog"
import { useDebounce } from "@/lib/utils/debounce"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { useFetch } from "@/lib/utils/use-fetch"
import { role } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import clsx from "clsx"
import { format } from "date-fns"
import { ChevronDown, ListFilter, MoreHorizontal, RotateCcw } from "lucide-react"
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import z from 'zod'
import { membersColumns } from "../../components/members-columns"
import AddMemberForm from "./add-member-form"
import AddRoleButton from "./add-role-btn"
import DemoteToClient from "./demote-form"
import ViewUserLogsTable from "./view-user-logs"
import { TooltipProvider } from "@/app/components/ui/tooltip"

export default function TableTop({ user }: { user: UserSession }) {

  const { data: roles, loading: fetching, error } = useFetch<z.infer<typeof role>[]>("/api/users/roles")

  // states
  const [openAddMember, setOpenAddMember] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [searchBy, setSearchBy] = useState<string>("email")
  const [filterValue, setFilterValue] = useState<string>("all")
  const [queryLink, setQueryLink] = useState<string>(`/users/members?page=1&filterby=${filterValue}`)

  // values
  const [searchValue, setSearchValue] = useState<string>("")

  const searchQuery = useDebounce(searchValue, 500)

  useEffect(() => {
    setQueryLink(`/users/members?page=${page}${(searchQuery.length > 0 ? `&searchby=${searchBy}&searchvalue=${searchQuery}` : "")}${filterValue.length > 0 ? `&filterby=${filterValue}` : ""}`)
  }, [page, searchQuery, searchBy, filterValue])

  const searchfilterComponent = (
    <>
      <Input placeholder={`@${searchBy}...`} className="max-w-[300px]" onChange={(e) => setSearchValue(e.target.value)} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <ListFilter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Search by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={searchBy} onValueChange={(e) => setSearchBy(e)}>
            <DropdownMenuRadioItem value="email">Email</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => {
            setSearchValue("")
            setSearchBy("email")
          }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  const filterComponent = (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filter {roles?.find((item) => item.id == filterValue)?.role || filterValue} <span><ChevronDown className="w-4 h-4" /></span></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Roles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filterValue} onValueChange={(e) => setFilterValue(e)}>
            {
              fetching ? (
                <p className="text-center">
                  <Spinner size="sm" />
                </p>
              ) : error ? (
                <p className="text-sm text-center text-red-500">Unable to get roles...</p>
              ) : (
                <>
                  <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                  {
                    roles?.map((item, i) => (
                      <DropdownMenuRadioItem value={item.id} key={i}>{item.role}</DropdownMenuRadioItem>
                    ))
                  }
                </>
              )
            }
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => setFilterValue("")}>
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddRoleButton />
    </>
  )

  const action = {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: any) => {

      const { setReload } = useReload()
      const { toast } = useToast()

      // states 
      const [loading, setLoading] = useState<boolean>(false)
      const [operation, setOperation] = useState<string>("")
      const [currentUser, setCurrentUser] = useState<UserSession | null>(null)

      useEffect(() => {
        const fetchData = async () => {
          const session = await getSession()

          if (!session) return

          setCurrentUser(session.user as UserSession)
        }

        fetchData()
      }, [])

      const blockUser = async () => {
        setLoading(true)

        const response = await blockAUser(row.original.id)
        setLoading(false)

        if (response.status == 500) {
          toast({
            title: "An error occured!",
            description: "Unable to block this user, please try again later!",
            variant: "destructive"
          })
          return
        }

        toast({
          title: "Blocked a user!",
          description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`,
        })
        setReload(true)
      }

      const unblockUser = async () => {
        setLoading(true)
        const response = await unblockAUser(row.original.id)
        setLoading(false)

        if (response.status == 500) {
          toast({
            title: "An error occured!",
            description: "Unable to unblock this user, please try again later!",
            variant: "destructive"
          })
          return
        }

        toast({
          title: "Unblocked a user!",
          description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`,
        })
        setReload(true)
      }

      const resetpassword = async () => {
        resetUserPassword(row.original.email, false, row.original.id)
        toast({
          title: "Email sent!",
          description: `${format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}`,
        })
        setOperation("")
      }

      return (
        <>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOperation("view")}>View logs</DropdownMenuItem>
              <DropdownMenuItem className={clsx("hidden", { "block": user.role.systemcontrol })} onClick={() => setOperation("set")}>Change role</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => setOperation("reset")}>Reset password</DropdownMenuItem>
              {
                row.original.id != user.id && row.original.block && new Date(row.original.block).getTime() > new Date().getTime() ? (
                  <>
                    <DropdownMenuItem onClick={() => setOperation("unblock")} className="text-green-500">Unblock user</DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : row.original.id != user.id && (
                  <DropdownMenuItem className="text-red-500"
                    disabled={row.original.block && new Date(row.original.block).getTime() > new Date().getTime()}
                    onClick={() => setOperation("block")}>Block user</DropdownMenuItem>
                )
              }
              <DropdownMenuItem className={clsx("hidden", { "block": user.role.systemcontrol })} onClick={() => setOperation("client")}>Set as client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
            <DialogContent className={clsx("", {
              "max-w-[80vw] max-h-[90vh] min-w-[80vw] min-h-[90vh]": operation == "view"
            })}>
              {
                operation == "set" && currentUser ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Set New Role</DialogTitle>
                      <DialogDescription>Assign a new role to the system member.</DialogDescription>
                    </DialogHeader>
                    <AddMemberForm currentUser={currentUser} close={() => setOperation("")} passedvalue={row.original} />
                  </>
                ) : operation == "block" ? (
                  <>
                    {
                      row.original.id == user.id ? (
                        <>
                          <DialogHeader>
                            <DialogTitle>Block a user</DialogTitle>
                            <DialogDescription>You are unable to block yourself.</DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button onClick={() => setOperation("")}>Understood</Button>
                          </DialogFooter>
                        </>
                      ) : (
                        <CoolDownDialog
                          open={true}
                          close={() => setOperation("")}
                          title={"Block a user"}
                          description="By blocking this user, you are preventing the user to use the system and it's functionality permanently until lifted. Please ensure this action is intended."
                          accept={() => blockUser()}
                          isContent
                        />
                      )
                    }
                  </>
                ) : operation == "unblock" ? (
                  <CoolDownDialog
                    open={true}
                    close={() => setOperation("")}
                    title={"Restore User Access"}
                    description="Reinstate this user's access to the website and system by unblocking them."
                    accept={() => unblockUser()}
                    cancel="Cancel"
                    proceedvariant={"default"}
                    isContent
                  />
                ) : operation == "reset" ? (
                  <CoolDownDialog
                    open={true}
                    close={() => setOperation("")}
                    title={"Reset account password"}
                    description="The system will send an email to the user's email containing the reset password link. Continue?"
                    accept={() => resetpassword()}
                    proceed="Yes, send"
                    proceedvariant={"default"}
                    isContent
                  />
                ) : operation == "client" ? (
                  <>
                    {
                      user.id == row.original.id ? (
                        <>
                          <DialogHeader>
                            <DialogTitle>Reset User Role</DialogTitle>
                            <DialogDescription>You are not able to modify your own role.</DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button onClick={() => setOperation("")}>Understood</Button>
                          </DialogFooter>
                        </>
                      ) : (
                        <DemoteToClient
                          currentUser={currentUser}
                          selectedUser={row.original}
                          close={() => setOperation("")} />
                      )
                    }
                  </>
                ) : operation == "view" && (
                  <div className="w-full h-full flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="capitalize">{row.original.firstname + " " + row.original.lastname} logs</DialogTitle>
                    </DialogHeader>
                    <TooltipProvider>
                      <ViewUserLogsTable userid={row.original.id} />
                    </TooltipProvider>
                  </div>
                )
              }
            </DialogContent>
          </Dialog>
          <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Processing, please wait..." />
        </>
      )
    },
  }

  return (
    <>
      <PaginationProvider changepage={setPage}>
        <TableWrapper
          api={queryLink}
          columns={[...membersColumns, action]}
          searchRef={"name"}
          addlabel="Add member"
          disablesearch
          callToAdd={() => setOpenAddMember(true)}
          filtercomponent={filterComponent}
          searchfiltercomponent={searchfilterComponent}
        />
      </PaginationProvider>
      <Dialog open={openAddMember} onOpenChange={(e) => setOpenAddMember(e)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Add a new system member to help you manage and organize.</DialogDescription>
          </DialogHeader>
          <AddMemberForm close={() => setOpenAddMember(false)} currentUser={user} />
        </DialogContent>
      </Dialog>
    </>
  )
}