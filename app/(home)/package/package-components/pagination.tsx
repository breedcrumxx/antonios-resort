'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination"
import { cn } from "@/lib/utils"
import clsx from "clsx"
import { useEffect, useState } from "react"

export function PaginationControls({
  maxPage,
  page,
  setPage,
  className,
}: {
  maxPage: number,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  className?: string
}) {

  const [pages, setPages] = useState<number[]>([])
  const [activePages, setActivePages] = useState<number[]>([])
  const [compact, setCompact] = useState<{
    leftCompact: boolean,
    rightCompact: boolean,
  }>({
    leftCompact: false,
    rightCompact: false,
  })
  const [offset, setOffset] = useState<number>(0)

  useEffect(() => {
    const allPages = Array.from({ length: maxPage }, (_, index) => index + 1)
    setPages([...allPages])

    if (maxPage > 5) {
      setCompact((prev) => ({ rightCompact: true, leftCompact: false }))
      setActivePages([...allPages.slice(0, 4)])
    } else {
      setActivePages([...allPages])
    }
  }, [maxPage])

  useEffect(() => {
    if (pages.length <= 5) return

    if (page == activePages[activePages.length - 1]) {
      const tempActivePages = pages.slice(offset + 2, 4 + (offset + 2))
      setActivePages([...tempActivePages])
      setOffset(offset + 2)

      if (tempActivePages[tempActivePages.length - 1] == pages.length) { // identify if the last page is present to the activePages
        // if present, remove the ... and the last page
        setCompact((prev) => ({ rightCompact: false, leftCompact: true }))
      }
    } else if (page == activePages[0] && page != 1) {
      const tempActivePages = pages.slice(offset - 2, (4 + offset) - 2)
      setActivePages([...tempActivePages])
      setOffset(offset - 2)

      if (tempActivePages[0] == pages[0]) { // identify if the last page is present to the activePages
        // if present, remove the ... and the last page
        setCompact((prev) => ({ rightCompact: true, leftCompact: false }))
      }
    }
  }, [page])

  const handlePrev = () => {
    if (page != 1) {
      setPage((prev: number) => prev - 1)
    }
  }
  const handleNext = () => {
    if (page != pages[pages.length - 1]) {
      setPage((prev: number) => prev + 1)
    }
  }

  return (
    <Pagination className={cn("", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious className={clsx("cursor-pointer", {
            "pointer-events-none opacity-70": pages.length == 0
          })} onClick={() => handlePrev()} />
        </PaginationItem>
        {
          compact.leftCompact && (
            <>
              {
                pages.slice(0, 1).map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink className="cursor-pointer" isActive={item == page} onClick={() => setPage(item)}>{item}</PaginationLink>
                  </PaginationItem>
                ))
              }
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )
        }
        {
          activePages.map((item) => (
            <PaginationItem key={item}>
              <PaginationLink className="cursor-pointer" isActive={item == page} onClick={() => setPage(item)}>{item}</PaginationLink>
            </PaginationItem>
          ))
        }
        {
          compact.rightCompact && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              {
                pages.slice(-1).map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink className="cursor-pointer" isActive={item == page} onClick={() => setPage(item)}>{item}</PaginationLink>
                  </PaginationItem>
                ))
              }
            </>
          )
        }
        <PaginationItem>
          <PaginationNext className={clsx("cursor-pointer", {
            "pointer-events-none opacity-70": pages.length == 0
          })} onClick={() => handleNext()} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
