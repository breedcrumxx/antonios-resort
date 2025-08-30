'use client'

import { Checkbox } from "@/app/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Label } from "@/app/components/ui/label"
import { defaultprofile } from "@/lib/configs/config-file"
import { ratinglink, saferatings } from "@/lib/zod/z-schema"
import { Spinner } from "@nextui-org/spinner"
import { Empty, message, Rate, Result } from "antd"
import { format } from "date-fns"
import Image from 'next/image'
import { useEffect, useState } from "react"
import { z } from "zod"
import './style.css'
import { useDebounce } from "@/lib/utils/debounce"
import { Button } from "@/app/components/ui/button"
import axios, { AxiosError } from "axios"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/app/components/ui/dropdown-menu"
import { ListFilter } from "lucide-react"

export default function CommentBox({ packageid }: { packageid: string }) {

  // states
  const [page, setPage] = useState<number>(1)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [hasmore, setHasmore] = useState<boolean>(false)
  const [rating, setRating] = useState<number>(0)

  // values
  const [data, setData] = useState<z.infer<typeof ratinglink>[]>([])

  const debouncedRating = useDebounce(rating, 300)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/packages/feedbacks/${packageid}?page=${page}&rating=${rating}`, { signal })

        setData((prev) => [...prev, ...response.data.feedbacks])
        // setHasmore(result.hasmore)

      } catch (error) {
        if (error instanceof AxiosError && error.code == "ERR_CANCELED") {
          return
        }
        if (error instanceof Error) {
          setError(JSON.stringify({ message: error.message, stack: error.stack }))
        }
        message.error("Unable to get feedbacks!")
      }
      setLoading(false)
    }

    setError("")
    if (debouncedRating > 0) {
      setData([])
    }
    setLoading(true)
    fetchData()

    return () => {
      controller.abort()
    }
  }, [page, debouncedRating])

  return (
    <>
      <div className="flex-grow flex flex-col sm:flex-row overflow-y-hidden">
        <div className="hidden sm:block w-1/3">
          <div className="w-1/3 space-y-4">
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 0} onCheckedChange={() => {
                setData([])
                setRating(0)
              }} />
              <Label>All</Label>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 5} onCheckedChange={() => setRating(5)} />
              <Label>5.0 Satisfactory</Label>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 4} onCheckedChange={() => setRating(4)} />
              <Label>4.0 Moderate</Label>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 3} onCheckedChange={() => setRating(3)} />
              <Label>3.0 Average</Label>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 2} onCheckedChange={() => setRating(2)} />
              <Label>2.0 Acceptable</Label>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <Checkbox id="satisfactory" checked={rating == 1} onCheckedChange={() => setRating(1)} />
              <Label>1.0 Fair</Label>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-max block sm:hidden self-end" variant="ghost">Filters
              <ListFilter className="ml-2 w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={rating == 0} onCheckedChange={() => {
                setData([])
                setRating(0)
              }}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={rating == 5} onCheckedChange={() => setRating(5)}
            >
              5 star
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={rating == 4} onCheckedChange={() => setRating(4)}
            >
              4 star
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={rating == 3} onCheckedChange={() => setRating(3)}
            >
              3 star
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={rating == 2} onCheckedChange={() => setRating(2)}
            >
              2 star
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={rating == 1} onCheckedChange={() => setRating(1)}
            >
              1 star
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {
          error.length > 0 ? (
            <div className="w-full h-full">
              <Result
                status="error"
                title="Unknown error occured!"
                subTitle="Sorry, we are unable to get the feedbacks and ratings."
                extra={<Button className="bg-prm">Report the problem</Button>}
              />
            </div>
          ) : (
            <div className="w-full overflow-y-auto scroll sm:px-4 sm:py-2">
              {
                data.map((item, i) => (
                  <div className="w-full p-2 max-h-[200px] rounded-md hover:bg-muted/50" key={i}>
                    <div className="flex gap-2 items-center">
                      <div className="h-[50px] w-[50px] rounded-full overflow-hidden relative">
                        <Image
                          src={item.booking.client.image || defaultprofile}
                          className="w-full h-auto object-fit aspect-square"
                          alt="profile-image"
                          fill
                        />
                      </div>
                      <div>
                        <p className="capitalize text-sm font-semibold">{item.booking.client.firstname + " " + item.booking.client.lastname}</p>
                        <p className="text-xs">{format(item.rated_at as Date, "PPP")}</p>
                      </div>
                    </div>
                    <Rate
                      className="comment"
                      allowHalf
                      value={(item.experience + item.cleanliness + item.facility + item.service) / 4}
                      disabled
                    />
                    <div className="w-full py-2 text-sm text-justify max-h-[150px] overflow-hidden">
                      {item.comment}
                    </div>
                  </div>
                ))
              }
              {
                loading ? (
                  <p className="text-center py-4">
                    <Spinner size="sm" label="Getting feedbacks..." />
                  </p>
                ) : hasmore ? (
                  <div className="w-full py-2 text-center text-sm hover:underline cursor-pointer" onClick={() => setPage((prev) => prev + 1)}>
                    Load more
                  </div>
                ) : !data || data.length == 0 && (
                  <Empty
                    description="No feedbacks found!"
                  />
                )
              }
            </div>
          )
        }
      </div>
    </>
  )
}

export function ViewMoreFeedbacks({ packageid }: { packageid: string }) {

  const [openCommentBox, setOpenCommentBox] = useState<boolean>(false)

  return (
    <>
      <div className="w-full py-2 text-center text-sm hover:underline cursor-pointer" onClick={() => setOpenCommentBox(true)}>
        View all
      </div>
      <Dialog open={openCommentBox} onOpenChange={(e) => setOpenCommentBox(e)}>
        <DialogContent className="sm:min-w-[60vw] min-h-[70vh] sm:max-w-[60vw] max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Feedback and Ratings</DialogTitle>
          </DialogHeader>
          <CommentBox packageid={packageid} />
        </DialogContent>
      </Dialog>
    </>
  )
}