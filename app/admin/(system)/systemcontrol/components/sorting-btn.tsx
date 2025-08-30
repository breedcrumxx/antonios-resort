'use client'

import { Button } from "@/app/components/ui/button"
import { ArrowUpWideNarrow, ArrowDownNarrowWide } from "lucide-react"


export default function SortingButton({ sort, setSort }: {
  sort: string,
  setSort: (value: string) => void,
}) {

  return (
    <Button variant={"outline"} className="capitalize" onClick={() => setSort(sort == "desc" ? "asc" : "desc")}>
      {
        sort == "desc" ? (
          <ArrowUpWideNarrow className="h-4 w-4" />
        ) : (
          <ArrowDownNarrowWide className="h-4 w-4" />
        )
      }
    </Button>
  )
}