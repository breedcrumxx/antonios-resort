'use client'

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { Separator } from "@/app/components/ui/separator";
import { GITHUB_KEY } from '@/lib/configs/config-file';
import { GithubIssue } from '@/lib/interfaces';
import { Spinner } from "@nextui-org/spinner";
import { Empty, message } from 'antd';
import axios from 'axios';
import clsx from 'clsx';
import { format } from "date-fns";
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ListFilter } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

export default function CaseContainer({ selectcase }: { selectcase: (data: GithubIssue) => void }) {

  // states
  const [status, setStatus] = useState<string>("all")
  const [loading, setLoading] = useState<boolean>(true)
  const [sort, setSort] = useState<string>("desc")
  const [type, setType] = useState<string>("all")

  // values
  const [data, setData] = useState<GithubIssue[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.github.com/repos/breedcrumxx/antonios/issues`, {
          headers: {
            Authorization: `token ${GITHUB_KEY}`,
            Accept: 'application/vnd.github.html+json',
          },
          signal
        });

        setLoading(false)
        setData(response.data)
      } catch (error) {
        setLoading(false)
        message.error("Unable to fetch github issues!")
      }
    }

    setLoading(true)
    fetchData()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <>
      <div className="border-b px-4 flex">
        <Button
          variant={type == "all" ? "default" : "ghost"}
          onClick={() => setType("all")}
          className="rounded-bl-none rounded-br-none">All</Button>
        <div className="flex-grow"></div>
        <Button variant={"ghost"} onClick={() => setSort((prev) => {
          if (prev == "asc") {
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            return "desc"
          } else {
            data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            return "asc"
          }
        })}>{
            sort == "desc" ? (
              <ArrowUpWideNarrow className="h-4 w-4" />
            ) : (
              <ArrowDownNarrowWide className="h-4 w-4" />
            )
          }</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"}><ListFilter className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={status == "all"}
              onCheckedChange={() => setStatus("all")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={status == "Open"}
              onCheckedChange={() => setStatus("Open")}
            >
              Open
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={status == "Close"}
              onCheckedChange={() => setStatus("Close")}
            >
              Close
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-grow p-4 py-2 space-y-2 overflow-y-scroll scroll">
        {
          loading ? (
            <div className="w-full flex items-center justify-center py-10">
              <Spinner label="Getting cases..." />
            </div>
          ) : (
            <>
              {
                data.length == 0 && (
                  <Empty />
                )
              }
              {
                data.filter((item) => {
                  if (status == "all") return true
                  if (item.state.toLowerCase() == status.toLowerCase()) return true
                  return false
                }).map((item, i) => (
                  <div
                    className="border rounded-md cursor-pointer"
                    onClick={() => selectcase(item)}
                    key={i}>
                    <div className="bg-muted px-2 py-1 flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.user.login} <span className="font-normal text-sm">Issue #{item.number}</span></p>
                      <Badge className={clsx("", {
                        "bg-green-500": item.state == "open",
                        "bg-red-500": item.state == "close",
                      })}>{item.state}</Badge>
                    </div>
                    <Separator />
                    <div className="px-2 py-1">
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 text-right">created {format(item.created_at, "MM/dd/yy")}</p>
                      <p className="text-xs text-gray-500 text-right">last updated {format(item.updated_at, "MM/dd/yy")}</p>
                    </div>
                  </div>
                ))
              }
            </>
          )
        }
      </div>
    </>
  )
}