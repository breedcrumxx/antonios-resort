'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/ui/select"
import { Skeleton } from "@/app/components/ui/skeleton"
import clsx from "clsx"
import { useEffect, useState } from "react"

export default function OverViewCard({
  title,
  subtitle,
  filters,
  filter,
  props,
  setFilter,
  functionToCall,
  money,
  disableselection
}: {
  title: string,
  subtitle: string,
  filters: string[],
  filter: string,
  props: any,
  setFilter: (item: string) => void,
  functionToCall: any,
  money?: boolean,
  disableselection?: boolean
}) {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // values 
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await functionToCall(...props)
      setLoading(false)

      if (response.status == 500) {
        setCount(0)
        setError(true)
        return
      }

      setError(false)
      setCount(response.data)
    }

    fetchData()
  }, [filter])

  return (
    <>
      {
        loading ? (
          <>
            <div className="w-full flex justify-between">
              <Skeleton className="h-auto w-8 bg-gray-500" />
              {
                !disableselection && (
                  <Select
                    value={filter}
                    onValueChange={(e) => setFilter(e)}
                  >
                    <SelectTrigger className="w-max gap-2 bg-black text-white">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          filters.map((item, i) => (
                            <SelectItem value={item} key={i}>{item}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )
              }
            </div>
            <Skeleton className="w-36 h-6 my-2" />
            <Skeleton className="w-24 h-4" />
          </>
        ) : (
          <>
            <div className="w-full flex justify-between">
              <p className={clsx('text-3xl font-semibold', {
                "text-red-500": error
              })}>
                {
                  money ? `₱ ${count.toLocaleString()}` : count
                }</p>
              {
                !disableselection && (
                  <Select
                    value={filter}
                    onValueChange={(e) => setFilter(e)}
                  >
                    <SelectTrigger className="w-max gap-2 bg-black text-white">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          filters.map((item, i) => (
                            <SelectItem value={item} key={i}>{item}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )
              }
            </div>
            <p className='font-semibold'>{title}</p>
            <p className={clsx("opacity-70 text-sm", {
              "text-red-500": error
            })}>{
                (error ? "An error occured!" : filter + ` ${subtitle}`)
              }</p>
          </>
        )
      }
    </>
  )
}