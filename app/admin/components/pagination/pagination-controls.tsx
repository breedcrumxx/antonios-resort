'use client'

import { Button } from "@/app/components/ui/button"
import clsx from "clsx"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { usePagination } from "./provider"

export function PaginationControls() {

  const { maxPage, page, setPage } = usePagination()

  const [pages, setPages] = useState<number[]>([])
  const [activePages, setActivePages] = useState<number[]>([])

  useEffect(() => {
    const allPages = Array.from({ length: maxPage }, (_, index) => index + 1)
    setPages([...allPages])

    if (maxPage > 10) {
      setActivePages([...allPages.slice(1, 9)])
    } else {
      setActivePages([...allPages])
    }
  }, [maxPage])

  useEffect(() => {
    if (pages.length <= 10) return

    if (page == maxPage) { // end
      // const allPages = Array.from({ length: maxPage }, (_, index) => index + 1)
      setActivePages(pages.slice(-9, -1))
    } else if (page == 1) { // start
      // const allPages = Array.from({ length: maxPage }, (_, index) => index + 1)
      setActivePages(pages.slice(1, 9))
    } else { // somewhere in the middle
      if (page + 5 >= maxPage) { // if the page selected will meet the end of the page
        setActivePages(pages.slice(-9, -1))
      } else if (page - 5 <= 1) {
        setActivePages(pages.slice(1, 9))
      } else if (page + 2 >= activePages[activePages.length - 1]) { // if near the end, move the pagination
        setActivePages(pages.slice(page - 3, page + 5))
      } else if (page - 2 <= activePages[0]) {
        setActivePages(pages.slice(page - 6, page + 2))
      }
    }
  }, [page])

  const handlePrev = () => {
    if (page != 1) {
      setPage((prev) => prev - 1)
    }
  }
  const handleNext = () => {
    if (page != pages[pages.length - 1]) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4 px-2">
      <Button variant={"ghost"} className={clsx("cursor-pointer gap-2", {
        "pointer-events-none opacity-70": pages.length == 0
      })} onClick={() => handlePrev()}>
        <ChevronLeft className="h-4 w-4" />
        <span>Prev</span>
      </Button>
      {
        maxPage > 5 && (
          <>
            {
              pages.slice(0, 1).map((item, i) => (
                <Button
                  variant={page == item ? "outline" : "ghost"}
                  onClick={() => setPage(item)}
                  key={i}
                >
                  {item}
                </Button>
              ))
            }
            <Button
              className="pointer-events-none"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </>
        )
      }
      {
        activePages.map((item, i) => (
          <Button
            variant={page == item ? "outline" : "ghost"}
            onClick={() => setPage(item)}
            key={i}
          >
            {item}
          </Button>
        ))
      }
      {
        maxPage > 5 && (
          <>
            <Button
              className="pointer-events-none"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {
              pages.slice(-1).map((item, i) => (
                <Button
                  variant={page == item ? "outline" : "ghost"}
                  onClick={() => setPage(item)}
                  key={i}
                >
                  {item}
                </Button>
              ))
            }
          </>
        )
      }
      <Button variant={"ghost"} className={clsx("cursor-pointer gap-2", {
        "pointer-events-none opacity-70": pages.length == 0
      })} onClick={() => handleNext()}>
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
