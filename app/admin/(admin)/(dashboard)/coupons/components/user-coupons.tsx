'use client'

import { membersColumns } from "@/app/admin/(system)/systemcontrol/components/members-columns"
import PaginationProvider from "@/app/admin/components/pagination/provider"
import TableWrapper from "@/app/admin/components/tables/table-wrapper"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import ReloadProvider from "@/app/providers/reloader"
import { useDebounce } from "@/lib/utils/debounce"
import { extendedcoupons } from "@/lib/zod/z-schema"
import { ListFilter, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function UserCouponDetails({ data }: { data: z.infer<typeof extendedcoupons> }) {

  // states
  const [page, setPage] = useState<number>(1)
  const [searchBy, setSearchBy] = useState<string>("email")
  const [sort, setSort] = useState<string>("asc")
  const [query, setQuery] = useState<string>(`/coupons/users/${data.id}?page=${page}&sort=${sort}`)

  // values
  const [searchValue, setSearchValue] = useState<string>("")

  const searchQuery = useDebounce(searchValue, 500)
  const sortValue = useDebounce(sort, 300)

  useEffect(() => {
    setQuery(`/coupons/users/${data.id}?page=${page}&sort=${sort}${(searchQuery.length > 0 ? `&searchby=${searchBy}&searchvalue=${searchQuery}` : "")}`)
  }, [page, searchBy, searchQuery, sortValue])

  const searchfilterComponent = (
    <>
      <Input placeholder={`@${searchBy}...`} className="max-w-[300px]" onChange={(e) => setSearchValue(e.target.value)} />
      <DropdownMenu>
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
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={(e) => setSort(e)}>
            <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
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

  return (
    <>
      <div className="flex-grow px-2 overflow-y-auto scroll">
        <ReloadProvider>
          <PaginationProvider changepage={setPage}>
            <TableWrapper
              api={query}
              columns={membersColumns}
              searchRef={"name"}
              disablesearch
              disableadd
              searchfiltercomponent={searchfilterComponent}
            />
          </PaginationProvider>
        </ReloadProvider>
      </div>
    </>
  )
}