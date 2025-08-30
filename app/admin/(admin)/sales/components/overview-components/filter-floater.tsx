'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useFilter } from "../provider"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { months } from "@/lib/utils/month-filter-utils"
import { ChevronDown, RotateCcw } from "lucide-react"
import { useState } from "react"

export default function FilterFloater() {

  const { setFilter, filters } = useFilter()

  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  const [month, setMonth] = useState<string>(months[new Date().getMonth()])

  const setDateRanges = (year: string, month: string) => {
    setYear(year)
    setMonth(month)
    const pos = months.indexOf(month)

    if (pos < 0) { // all is selected

      const getdates = {
        start: new Date(parseInt(year), 0, 1),
        end: new Date(parseInt(year), 12, 0)
      }
      const comparedates = { start: new Date(`${parseInt(year) - 1}-01-01`), end: new Date(`${parseInt(year) - 1}-12-31`) }

      setFilter({ get: getdates, compare: comparedates })
      return
    }

    const start = new Date(`${year} ${month}`)
    const getdates = {
      start: new Date(new Date().setFullYear(start.getFullYear(), start.getMonth(), 1)),
      end: new Date(start.getFullYear(), start.getMonth() + 1, 0)
    }

    if (pos == 0) { // if the month is january, get the december from last year
      const comparedates = { start: new Date(parseInt(year), -1, 1), end: new Date(parseInt(year), 0, 0) }

      setFilter({ get: getdates, compare: comparedates })
      return
    }

    const comparedates = { start: new Date(new Date().setFullYear(start.getFullYear(), start.getMonth() - 1, 1)), end: new Date(start.getFullYear(), start.getMonth(), 0) }

    setFilter({ get: getdates, compare: comparedates })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex gap-2 text-sm items-center">{month + ", " + year} <ChevronDown className="w-4 h-4" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Date</DropdownMenuLabel>
          <div className="flex">
            <Select
              value={year}
              onValueChange={(e) => {
                setDateRanges(e, month)
              }}
            >
              <SelectTrigger className="w-full gap-2 border-none outline-none focus:ring-0">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectGroup>
                  {
                    Array.from({ length: new Date().getFullYear() - 2018 + 1 }, (_, i) => 2018 + i).reverse().map((item, i) => (
                      <SelectItem value={item.toString()} key={i}>{item}</SelectItem>
                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={month}
              onValueChange={(e) => {
                setDateRanges(year, e)
              }}
            >
              <SelectTrigger className="w-full gap-2 border-none outline-none focus:ring-0">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {
                    filters.map((item: string, i: number) => (
                      <SelectItem value={item} key={i}>{item}</SelectItem>
                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}