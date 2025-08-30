'use client'

import { AnimatedTooltip } from "@/app/components/ui/animated-tooltip"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { Textarea } from "@/app/components/ui/textarea"
import { defaultprofile, GITHUB_KEY } from "@/lib/configs/config-file"
import { GithubComment, GithubEvent, GithubIssue } from "@/lib/interfaces"
import { message } from "antd"
import axios from 'axios'
import { formatDistanceToNow } from "date-fns"
import { ChevronUp, Github } from "lucide-react"
import Image from 'next/image'
import React, { useEffect, useState } from "react"

import { getSamplesOfThisIssue } from "@/lib/actions/system-actions/case-action"
import { problemreport } from "@/lib/zod/z-schema"
import clsx from "clsx"
import Link from "next/link"
import { z } from "zod"
import './better-headings.css'

type CombinedType = ({
  type: "comment"
  created_at: Date
  payload: GithubComment
} | {
  type: "event"
  created_at: Date
  payload: GithubEvent
})

export default function CaseViewer({ data }: { data: GithubIssue }) {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [viewSamples, setViewSamples] = useState<boolean>(false)

  // values
  const [participants, setParticipants] = useState<any>([data.user])
  const [comments, setComments] = useState<GithubComment[]>([])
  const [events, setEvents] = useState<GithubEvent[]>([])
  const [combinedData, setCombinedData] = useState<CombinedType[]>([])
  const [comment, setComment] = useState<string>("")
  const [samples, setSamples] = useState<z.infer<typeof problemreport>[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const commentsResponse = await axios.get(`https://api.github.com/repos/breedcrumxx/antonios/issues/${data.number}/comments`, {
          method: "GET",
          headers: {
            Authorization: `token ${GITHUB_KEY}`,
            Accept: 'application/vnd.github.html+json',
          },
          signal
        });

        const eventsResponse = await axios.get(`https://api.github.com/repos/breedcrumxx/antonios/issues/${data.number}/events`, {
          headers: {
            Authorization: `token ${GITHUB_KEY}`,
            Accept: 'application/vnd.github.html+json',
          },
        });
        setLoading(false)

        const eventUsers = eventsResponse.data.map((event: any) => ({
          avatar: event.actor.avatar_url,
          user: event.actor.login,
        }));

        const commenters = commentsResponse.data.map((comment: any) => ({
          avatar: comment.user.avatar_url,
          user: comment.user.login,
        }));

        const allParticipants = [...commenters, ...eventUsers];

        const participantsMap = new Map();
        allParticipants.forEach((participant: any) => {
          participantsMap.set(participant.user, participant);
        })

        const participants = Array.from(participantsMap.values())

        setParticipants(participants)

        console.log(participants)

        setComments(commentsResponse.data)
        setEvents(eventsResponse.data)

        let temp: any[] = []

        temp.push(...commentsResponse.data.map((item: any) => ({
          type: "comment",
          created_at: item.created_at,
          payload: item,
        })))
        temp.push(...eventsResponse.data.map((item: any) => ({
          type: "event",
          created_at: item.created_at,
          payload: item,
        })))

        setCombinedData(temp.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) // sort asc
      } catch (error: any) {
        setLoading(false)
        console.error('Error fetching issues:', error.response ? error.response.data : error.message);
        message.error("Unable to fetch github issues!")
      }
    }

    setLoading(true)
    fetchData()

    return () => {
      controller.abort()
    }
  }, [])

  const postComment = async () => {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/breedcrumxx/antonios/issues/${data.number}/comments`,
        { body: `${comment}\n\n![test](https://avatars.githubusercontent.com/u/98546891?v=4)` },
        {
          headers: {
            Authorization: `token ${GITHUB_KEY}`,
            Accept: 'application/vnd.github.html+json',
          },
        }
      );

      // Update comments and combinedData state
      setComments((prev: any) => [...prev, response.data]);
      setCombinedData((prev: any) => [
        ...prev,
        {
          type: "comment",
          created_at: response.data.created_at,
          payload: response.data,
        }
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

    } catch (error: any) {
      console.error('Unable to post a comment:', error.response ? error.response.data : error.message);
      message.error("Unable to post a comment!");
    }

    setComment("")
  };

  return (
    <div className="w-full flex-grow overflow-hidden flex gap-4">
      <div className="w-2/3 space-y-4 overflow-y-auto scroll pr-2 pb-10">
        {
          !viewSamples ? (
            <>
              <div className="max-w-[100%] min-w-[100%] flex gap-2">
                <div className="min-h-[30px] min-w-[30px] max-h-[30px] max-w-[30px] bg-gray-500 rounded-full relative overflow-hidden">
                  <Image
                    fill
                    src={data.user.avatar_url}
                    alt="creator-avatar"
                  />
                </div>
                <div className="w-full h-max rounded-md border overflow-hidden">
                  <div className="flex items-center px-2 py-1 border-b gap-2 text-sm bg-muted/70">
                    <p className="font-semibold">{data.user.login}</p>
                    <p className="text-xs">commented {formatDistanceToNow(data.created_at, { addSuffix: true })}</p>
                  </div>
                  <div
                    className="p-2 git-box space-y-2"
                    dangerouslySetInnerHTML={{ __html: data.body || data.body_html }}>
                  </div>
                </div>
              </div>

              {
                combinedData.map((item: CombinedType, i: number) => {
                  if (item.type == "comment") {
                    return (
                      <div className="w-full flex gap-2" key={i}>
                        <div className="min-h-[30px] min-w-[30px] max-h-[30px] max-w-[30px] bg-gray-500 rounded-full relative overflow-hidden">
                          <Image
                            fill
                            src={item.payload.user.avatar_url}
                            alt="creator-avatar"
                          />
                        </div>
                        <div className="w-full h-max rounded-md border">
                          <div className="flex items-center px-2 py-1 border-b gap-2 text-sm bg-muted/70">
                            <p className="font-semibold">{item.payload.user.login}</p>
                            <p className="text-xs">commented {formatDistanceToNow(item.payload.created_at, { addSuffix: true })}</p>
                          </div>
                          <div
                            className="p-2 git-box space-y-2"
                            dangerouslySetInnerHTML={{ __html: data.body || data.body_html }}>
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="flex items-center gap-2 pl-16 text-sm" key={i}>
                        <div className="min-h-[20px] min-w-[20px] max-h-[20px] max-w-[20px] bg-gray-500 rounded-full relative overflow-hidden">
                          <Image
                            fill
                            src={item.payload.actor.avatar_url}
                            alt="creator-avatar"
                          />
                        </div>
                        <p className="font-semibold">{item.payload.actor.login}</p>
                        <p>-</p>
                        <p>{item.payload.event} {formatDistanceToNow(item.payload.created_at, { addSuffix: true })} </p>
                      </div>
                    )
                  }
                })
              }

              <Separator />

              <div className="w-full flex gap-2">
                <div className="min-h-[30px] min-w-[30px] max-h-[30px] max-w-[30px] bg-gray-500 rounded-full relative overflow-hidden">
                  <Image
                    fill
                    src={data.user.avatar_url}
                    alt="creator-avatar"
                  />
                </div>
                <div className="w-full h-max space-y-2">
                  <div className="rounded-md border">
                    <div className="flex items-center px-2 py-1 border-b gap-2 text-sm bg-muted/70">
                      <p className="font-semibold">{data.user.login}</p>
                      <p className="text-xs">post a comment</p>
                    </div>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="h-max min-h-[60px] border-none"
                      placeholder="add a comment here..." />
                  </div>
                  <p className="text-sm text-gray-500">Github supports markdown, please read the <Link href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#headings" className="cursor-pointer text-blue-500 hover:underline">Github markdown</Link> documentation.</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="text-xs bg-green-500"
                      disabled={comment.length == 0}
                      onClick={() => postComment()}>Comment</Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2 overflow-y-auto scroll pr-2">
              {
                samples.map((item, i) => (
                  <Samples data={item} key={i} />
                ))
              }
            </div>
          )
        }

      </div>

      <div className="w-1/3">
        <div className="w-full h-[200px] p-2 space-y-2">
          <div>
            <p className="text-sm font-semibold">Labels</p>
            <div className="flex flex-wrap gap-2">
              {
                data.labels.map((item: GithubLabel) => (
                  <Badge
                    style={{ backgroundColor: `#${item.color}` }}
                    key={`${item.id}`}>{item.name}</Badge>
                ))
              }
            </div>
          </div>
          <div>
            <p className="text-sm">Participants</p>
            <div className="flex w-full">
              <AnimatedTooltip
                sizes={"h-8 w-8"}
                items={participants.map((item: { avatar: string, user: string }, i: number) => ({ id: i + 1, name: item.user, designation: "", image: item.avatar || defaultprofile }))} />
            </div>
          </div>
          <LoadSamples
            issueid={data.number}
            setSamples={setSamples}
            setViewSamples={setViewSamples}
          />

          <Button className="w-full" onClick={() => {
            window.open(data.html_url, '_blank');
          }}>Open to <Github className="mx-1 h-4 w-4" /> Github directly</Button>
        </div>
      </div>
    </div>
  )
}

export function LoadSamples({ issueid, setSamples, setViewSamples }: {
  issueid: number,
  setSamples: React.Dispatch<React.SetStateAction<z.infer<typeof problemreport>[]>>,
  setViewSamples: React.Dispatch<React.SetStateAction<boolean>>
}) {

  // states 
  const [loading, setLoading] = useState<boolean>(true)

  // values
  const [sampleCount, setSampleCount] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSamplesOfThisIssue(issueid)
      setLoading(false)

      console.log(response)

      if (response.status == 500 || response.status == 404) {
        message.error("Unable to get samples!")
        return
      }

      setSamples(response.data)
      setSampleCount(response.data.length)
    }

    fetchData()
  }, [])

  return (
    <div>
      <p className="text-sm">Samples</p>
      {
        loading ? (
          <p className="text-xs">loading samples...</p>
        ) : (
          <p className={clsx("text-xs cursor-pointer hover:underline", {
            "pointer-events-none": loading || sampleCount == 0
          })}
            onClick={() => setViewSamples((prev) => !prev)}
          >{sampleCount} samples exist</p>
        )
      }
    </div>
  )
}

export function Samples({ data, key }: { data: z.infer<typeof problemreport>, key: number }) {

  // state
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <div
      className="w-full border rounded-md flex flex-col"
      key={key}
    >
      <div className="flex gap-2 items-center border-b p-1 px-2 text-sm">
        <p className="font-semibold">{data.issueid}</p>
        <p>-</p>
        <p>{data.code}</p>
        <div className="flex-grow"></div>
        <p className="text-xs">Submitted {formatDistanceToNow(data.datetime, { addSuffix: true })}</p>
      </div>
      <div className="min-h-[80px] p-2 text-sm">
        <p>{data.report}</p>
      </div>
      {isExpanded && (
        <div className="px-2 space-y-2">
          <div className="space-y-1">
            <h1 className="font-semibold text-gray-500">Error message</h1>
            <div className="min-h-[80px] text-red-500 px-4 py-2 text-sm bg-black rounded-md">{data.errormessage}</div>
          </div>
          <div className="space-y-1">
            <h1 className="font-semibold text-gray-500">Error stacktrace</h1>
            <div className="min-h-[80px] text-red-500 px-4 py-2 text-sm bg-black rounded-md">{data.stacktrace}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center py-1 border-t cursor-pointer group bg-muted/70 hover:bg-muted/40" onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronUp className="h-4 w-4 mr-1" />
        <p className="text-sm group-hover:underline">View</p>
      </div>
    </div>
  )
}
