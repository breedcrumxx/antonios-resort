'use client'

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { chat } from "@/lib/zod/z-schema"
import { message } from "antd"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { z } from "zod"
import { checkDiscussion } from "../discussion-actions/discussion-action"
import { openDiscussion } from "../discussion-actions/open-discussion"
import { useChat } from "../provider"
import { useDialogs } from "./dialog-provider"
import { socket } from '@/lib/sockets'

const blockedAccountIntroDialogs: z.infer<typeof chat>[] = [
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Client",
    status: "sent",
    type: "message",
    content: "My account got blocked",
    discussionid: "",
  },
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Admin",
    status: "sent",
    type: "message",
    content: "Sometimes, accounts are blocked due to suspicious activity such as trolling, fraudulent actions, or other violations of our terms of service. Please avoid these activities to prevent you from getting blocked.",
    discussionid: "",
  },
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Admin",
    status: "sent",
    type: "message",
    content: "Need more help?",
    discussionid: "",
  }
]

const openDiscussionIntroDialogs: z.infer<typeof chat>[] = [
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Client",
    type: "message",
    status: "sent",
    content: "Open discussion",
    discussionid: "",
  },
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Admin",
    type: "message",
    status: "sent",
    content: "Please provide your discussion ticket ID...",
    discussionid: "",
  },
]

const ReservationIssueIntroDialogs: z.infer<typeof chat>[] = [
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Client",
    type: "message",
    status: "sent",
    content: "I need help with regarding with my reservation.",
    discussionid: "",
  },
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Admin",
    type: "message",
    status: "sent",
    content: "Choose a topic",
    discussionid: "",
  },
]

const NewDiscussionIntroDialogs: z.infer<typeof chat>[] = [
  {
    id: '',
    date: new Date().getTime(),
    seen: false,
    sender: "Admin",
    status: "sent",
    type: "message",
    content: "What topic do you want to discuss?",
    discussionid: "",
  },
]

const searchingDialog = {
  id: '',
  date: new Date().getTime(),
  seen: false,
  sender: "Admin",
  type: "message",
  status: "sent",
  content: "Please wait...",
  discussionid: "",
}

const errorDialog = {
  id: '',
  date: new Date().getTime(),
  seen: false,
  sender: "Admin",
  type: "message",
  status: "sent",
  content: "An error occured while processing your request, please try again later.",
  discussionid: "",
}

const missingDialog = {
  id: '',
  date: new Date().getTime(),
  seen: false,
  sender: "Admin",
  type: "message",
  content: "We cannot find your discussion, please make sure the discussion ID is correct. Type 'cancel' to cancel the searching.",
  status: "sent",
  discussionid: "",
}

export const StartBlockedExtension = ({ cancelPrompt }: { cancelPrompt: () => void }) => {

  // context
  const { setOperation, setDiscussionid } = useChat()
  const { setDialogs } = useDialogs()

  useEffect(() => {
    socket.connect()
    setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, ...blockedAccountIntroDialogs]))

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleActionToIssue = async (prompt: boolean) => {
    cancelPrompt()
    setDialogs((prev: z.infer<typeof chat>[]) => [...prev,
    {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Client",
      content: prompt ? "Yes, please" : "No, thanks",
      status: "sent",
      type: "message",
      discussionid: "",
    }])
    if (prompt) {
      setDialogs((prev: z.infer<typeof chat>[]) => [...prev,
      {
        id: '',
        date: new Date().getTime(),
        seen: false,
        sender: "Admin",
        status: "sent",
        type: "message",
        content: "I will open a discussion for you, please wait...",
        discussionid: "",
      }])

      const response = await openDiscussion("My account got blocked, I need an assistance.", "Account issue")

      if (response.status == 500) {
        message.error("Cannot open a discussion at the moment, please try again later.")
        setOperation("default")
        return
      }

      if (socket.connected) {
        socket.emit("changes")
      }

      setDiscussionid(response.data as string)
      setOperation("discussion")

      return
    }
  }

  return (
    <div className="flex justify-center gap-5 py-4">
      <Button onClick={() => handleActionToIssue(true)} variant={"outline"} className="rounded-[50px]">Yes, please</Button>
      <Button onClick={() => handleActionToIssue(false)} variant={"outline"} className="rounded-[50px]">No, thanks</Button>
    </div>
  )

}

export const StartOpenDiscussionExtension = ({ cancelPrompt }: { cancelPrompt: () => void }) => {

  // context
  const { setOperation, setDiscussionid } = useChat()
  const { setDialogs } = useDialogs()

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // values
  const [selectedDiscussion, setSelectedDiscussion] = useState<string>("")

  useEffect(() => {
    setDialogs((prev) => ([...prev, ...openDiscussionIntroDialogs]))
  }, [])

  const searchDiscussion = async () => {

    setLoading(true)

    if (selectedDiscussion.toLowerCase() == "cancel") { // cancel the operation
      setDialogs((prev) => ([...prev, {
        id: '',
        date: new Date().getTime(),
        seen: false,
        sender: "Client",
        type: "message",
        status: "sent",
        content: selectedDiscussion,
        discussionid: "",
      }, { ...searchingDialog, date: new Date().getTime() }
      ]))
      cancelPrompt()
      return
    }

    setDialogs((prev) => ([...prev, {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Client",
      type: "message",
      status: "sent",
      content: selectedDiscussion,
      discussionid: "",
    }, { ...searchingDialog, date: new Date().getTime() }
    ]))

    const response = await checkDiscussion(selectedDiscussion)

    setLoading(false)
    setSelectedDiscussion("")

    if (response.status == 500) {
      setDialogs((prev) => ([...prev, { ...errorDialog, date: new Date().getTime() }]))
      setOperation("default")
      return
    } else if (response.status == 404) {
      setDialogs((prev) => ([...prev, { ...missingDialog, date: new Date().getTime() }]))
      return
    }

    setDiscussionid(selectedDiscussion)
    setOperation("discussion")
  }

  return (
    <div className="w-full p-2 pt-0">
      <Input
        placeholder="discussion ID..."
        value={selectedDiscussion}
        onChange={(e) => setSelectedDiscussion(e.target.value)}
        onKeyDown={(e) => {
          if (e.code == 'Enter' && selectedDiscussion.length > 0) {
            searchDiscussion()
          } else {
            return e
          }
        }}
        disabled={loading}
      />
    </div>
  )
}

export const StartReservationIssueExtension = ({ cancelPrompt }: { cancelPrompt: () => void }) => {

  const topics = [
    {
      topic: "Placing a reservation", content: `
      <p>You can place a reservation by logging in.</p>
      <p>1. Go to offers page on the website and choose your package.</p>
      <p>2. Choose a date for reservation, and prepare the necessary payment.</p>
      <p>3. Proceed and wait for approval of your reservation.</p>
    `},
    {
      topic: "Cancellation of booking", content: `
      <p>Cancelling your reservation is easy.</p>
      <p>1. Login to your account and go to your profile</p>
      <p>3. Select the booking and click the cancel button.</p>
      <p>4. Provide a valid reason for cancellation and your done.</p>
    `},
    {
      topic: "Rescheduling my reservation", content: `
    <p>Rescheduling your reservation is easy.</p>
      <p>1. Login to your account and go to your profile</p>
      <p>2. Choose the booking your want to reschedule and click view details.</p>
      <p>3. Click the reschedule button and you will be redirected to the rescheduling page.</p>
      <p>4. You can choose a new date for you reservation and click confirm.</p>
      <p>5. You can check the how rescheduling works on the rescheduling page for more information.</p>
    `},
    {
      topic: "Refund my booking", content: `
    <p>Refund can only be processed after your booking is completed, rejected, or cancelled.</p>
      <p>1.You can request your refund by clicking the view details of your booking.</p>
      <p>2. You can see on the view details about your refund status and other details.</p>
      <p>3. Click the refund button to submit a refund request.</p>
      <p>4. Wait for the admin to confirm the validity of your refund and wait for further instructions.</p>
    `},
  ]

  // context
  const { setOperation, setDiscussionid } = useChat()
  const { setDialogs } = useDialogs()

  // states
  const [showPrompts, setShowPrompts] = useState<boolean>(true)

  // values
  const [selectedTopic, setSelectedTopic] = useState<number>(0)

  useEffect(() => {
    setDialogs((prev) => ([...prev, ...ReservationIssueIntroDialogs]))
  }, [])

  const handleClickTopics = (i: number) => {
    setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Client",
      type: "message",
      status: "sent",
      content: topics[i].topic,
      discussionid: "",
    },
    {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Admin",
      type: "message",
      status: "sent",
      content: topics[i].content,
      discussionid: "",
    }
    ]))

    setSelectedTopic(i)
  }

  const handleOpenDiscussion = async (i: number) => {
    setShowPrompts(false)

    setDialogs((prev) => [...prev,
    {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Admin",
      status: "sent",
      type: "message",
      content: "I will open a discussion for you, please wait...",
      discussionid: "",
    }])

    const response = await openDiscussion(topics[i].topic, "I need assistance.")

    if (response.status == 500) {
      setDialogs((prev) => [...prev,
      {
        id: '',
        date: new Date().getTime(),
        seen: false,
        sender: "Admin",
        status: "sent",
        type: "message",
        content: "Cannot open a discussion at the moment, please try again later.",
        discussionid: "",
      }])
      return
    }

    setDiscussionid(response.data as string)
    setOperation("discussion")
  }

  return (
    <>
      {
        showPrompts && (
          <div className="flex flex-wrap gap-2 my-2">
            {
              topics.map((item, i) => (
                <Button variant={"outline"} className="rounded-[50px] text-xs w-max px-2 py-1" key={i} onClick={() => handleClickTopics(i)}>{item.topic}</Button>
              ))
            }
            {
              selectedTopic != 0 && (
                <Button variant={"outline"} className="rounded-[50px] text-xs w-max px-2 py-1" onClick={() => handleOpenDiscussion(selectedTopic)}>Open discussion</Button>
              )
            }
            <Button variant={"outline"} className="rounded-[50px] text-xs w-max px-2 py-1" onClick={() => cancelPrompt()}>Close</Button>
          </div>
        )
      }
    </>
  )

}

export const StartNewDiscussionExtension = ({ cancelPrompt }: { cancelPrompt: () => void }) => {

  const topics = [
    "Cancel my booking",
    "My booking got rejected",
    "Reschedule my reservation",
    "Others"
  ];

  // context
  const { booking, setOperation, setBooking, setDiscussionid } = useChat()
  const { setDialogs } = useDialogs()

  // states
  const [showPrompts, setShowPrompts] = useState<boolean>(true)

  useEffect(() => {
    if (booking) {
      setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
        id: '',
        date: new Date().getTime(),
        seen: false,
        sender: "Client",
        status: "sent",
        type: "message",
        content: `I want to open a new discussion for my booking with booking ID ${booking.bookingid}`,
        discussionid: "",
      }, ...NewDiscussionIntroDialogs]))
    }
  }, [booking])

  const handleAction = async (i: number) => {
    if (!booking) return
    setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Client",
      status: "sent",
      type: "message",
      content: topics[i],
      discussionid: "",
    }]))

    if (i == 0) {
      // check for booking status
      if (['Rejected', 'Completed', 'Ongoing', 'Cancelled'].includes(booking.status)) {
        setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
          id: '',
          date: new Date().getTime(),
          seen: false,
          sender: "Admin",
          status: "sent",
          type: "message",
          content: `Sorry, but your booking was already been ${booking.status}.`,
          discussionid: "",
        }]))
        return
      }
    } else if (i == 1) {
      if (booking.status != "Rejected") {
        setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
          id: '',
          date: new Date().getTime(),
          seen: false,
          sender: "Admin",
          status: "sent",
          type: "message",
          content: `Sorry, but your booking seems to be ${booking.status}.`,
          discussionid: "",
        }]))
        return
      }
    } else if (i == 2) {
      if (booking.status != "Approved") {
        setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
          id: '',
          date: new Date().getTime(),
          seen: false,
          sender: "Admin",
          status: "sent",
          type: "message",
          content: `Sorry, but you can only reschedule an approved booking.`,
          discussionid: "",
        }]))
        return
      }
    }

    handleOpenDiscussion(i)
  }

  const handleOpenDiscussion = async (i: number) => {
    setShowPrompts(false)

    if (!booking) {
      message.error("booking data went missing, please try again later!")
      return
    }

    setDialogs((prev) => [...prev,
    {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Admin",
      status: "sent",
      type: "message",
      content: "I will open a discussion for you, please wait...",
      discussionid: "",
    }])

    let defaultMessage = ""

    if (i == 0) {
      defaultMessage = `Can you cancel my booking, with booking ID ${booking.bookingid}?`
    } else if (i == 1) {
      defaultMessage = `Why my booking with booking ID ${booking.bookingid} got rejected?`
    } else if (i == 2) {
      defaultMessage = `Can you reschedule my booking with booking ID ${booking.bookingid}?`
    } else if (i == 3) {
      defaultMessage = `I have a concern about my booking with booking ID ${booking.bookingid}.`
    }

    const response = await openDiscussion(defaultMessage, "I need assistance.", booking.id)

    if (response.status == 500) {
      setDialogs((prev) => [...prev,
      {
        id: '',
        date: new Date().getTime(),
        seen: false,
        sender: "Admin",
        status: "sent",
        type: "message",
        content: "Cannot open a discussion at the moment, please try again later.",
        discussionid: "",
      }])
      return
    }

    setDiscussionid(response.data as string)
    setOperation("discussion")
  }

  const cancelOperation = () => {
    setDialogs((prev: z.infer<typeof chat>[]) => ([...prev, {
      id: '',
      date: new Date().getTime(),
      seen: false,
      sender: "Client",
      status: "sent",
      type: "message",
      content: `Cancel`,
      discussionid: "",
    }]))
    setOperation("default")
    setBooking(null)
    cancelPrompt()
  }

  return (
    <>
      {
        showPrompts && (
          <div className="w-full flex flex-wrap justify-center gap-2">
            {
              topics.map((item, i) => (
                <Button
                  variant={"outline"}
                  className="rounded-[50px] text-xs w-max px-2 py-1"
                  onClick={() => handleAction(i)}
                  key={i}
                >{item}</Button>
              ))
            }
            <Button variant={"outline"} className="rounded-[50px] text-xs w-max px-2 py-1" onClick={() => cancelOperation()}>Cancel</Button>
          </div>
        )
      }
    </>
  )

}