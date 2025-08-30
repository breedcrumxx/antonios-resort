'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/app/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { Separator } from "@/app/components/ui/separator"
import { Skeleton } from "@/app/components/ui/skeleton"
import { defaultprofile } from "@/lib/configs/config-file"
import { useDebounce } from "@/lib/utils/debounce"
import { user } from "@/lib/zod/z-schema"
import { message } from "antd"
import { ListFilter, Search } from "lucide-react"
import { useEffect, useState } from "react"
import z from 'zod'

export default function SearchUserCore({ open, close, setuser }: { open: boolean, close: () => void, setuser: (value: z.infer<typeof user>) => void }) {

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [emailSearch, setEmailSearch] = useState<string>("")
  const searchItem = useDebounce(emailSearch, 500)
  const [searchBy, setSearchBy] = useState<string>("email")

  // values
  const [searchedUsers, setSearchedUsers] = useState<z.infer<typeof user>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/${searchItem}?by=${searchBy}`, { method: "GET" })

        if (!response.ok) throw new Error()

        const result = await response.json()
        setSearchedUsers(result)

      } catch (error) {
        message.error("Unable to get results!")
      }

      setLoading(false)
    }

    if (searchItem.length > 0) {
      fetchData()
    }
  }, [searchItem, searchBy])

  const cleanup = () => {
    close()
    setLoading(false)
    setEmailSearch("")
    setSearchedUsers([])
  }

  return (
    <Dialog open={open} onOpenChange={(e) => cleanup()}>
      <DialogContent disableclose>
        <div className="flex items-center">
          <Search className="w-4 h-4" />
          <Input placeholder={`@${searchBy}`} className="no-border" onChange={(e) => {
            if (e.target.value.length > 0) {
              setLoading(true)
            }
            setEmailSearch(e.target.value)
          }} />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className="w-max" variant="ghost">
                <ListFilter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Search by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSearchBy("email")}>Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchBy("name")}>Name</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        <div className="max-h-[40vh] overflow-y-scroll scroll">
          {
            loading ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-[50px] w-[50px] rounded-[100px]" />
                  <div className="flex flex-col justify-center space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-[50px] w-[50px] rounded-[100px]" />
                  <div className="flex flex-col justify-center space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-[50px] w-[50px] rounded-[100px]" />
                  <div className="flex flex-col justify-center space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
              </div>
            ) : searchedUsers.length == 0 ? (
              <p className="text-center text-sm opacity-70">No result...</p>
            ) : (
              <div className="space-y-2">
                {
                  searchedUsers.map((item, i) => (
                    <div className="flex gap-2 cursor-pointer" key={i} onClick={() => {
                      setuser(item)
                      cleanup()
                    }}>
                      <div className="h-[50px] w-[50px] rounded-[100px] overflow-hidden" >
                        <img
                          className="w-full h-full aspect-auto"
                          src={item.image || defaultprofile} alt="user-profile" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="capitalize text-sm font-semibold">{item.firstname + " " + item.lastname}</p>
                        <p className="text-xs">{item.email}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
        <Separator />
        <DialogFooter>
          <p className="text-xs opacity-70">Search user by their registered {searchBy}.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}