'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Textarea } from "@/app/components/ui/textarea"
import { SingleImageDropzone } from "@/app/components/upload-dropdown/image-dropzone"
import { message, Result } from "antd"
import clsx from "clsx"
import html2canvas from "html2canvas-pro"
import { Paperclip, X } from "lucide-react"
import { useEffect, useState } from "react"
import { submitReport } from "../actions/system-actions/submit-report"

export function StaleReport({ error, code, open, close }: { error: string, code: string, open: boolean, close: () => void }) {

  // values
  const [reportImage, setReportImage] = useState<string>("")
  const [reportDetails, setReportDetails] = useState<string>("")

  useEffect(() => {
    const target = document.body
    html2canvas(target).then(canvas => {
      const imageURL = canvas.toDataURL("image/png");
      setReportImage(imageURL)
    })
  }, [])

  const submit = async () => {
    if (reportDetails.length == 0) {
      message.error("Please describe the issue to help us fix the problem.")
      return
    }
    if (reportImage.length == 0) {
      message.error("Please attach an image of your concern to help us fix the problem.")
      return
    }
    submitReport(error, code, reportDetails, reportImage, "Moderate")

    const reported = sessionStorage.getItem("errors")

    if (reported) {
      sessionStorage.setItem('errors', JSON.stringify([...JSON.parse(reported), code]))
    } else {
      sessionStorage.setItem("errors", JSON.stringify([code]))
    }

    message.success("Submitted an error report.")
    close()
  }

  return (
    <>
      <ErrorReportModal
        open={open}
        close={close}
        attachment={reportImage}
        setAttachment={setReportImage}
        setDetails={setReportDetails}
        submit={submit}
      />
    </>
  )
}

export function ErrorReportModal({ open, close, attachment, setDetails, submit, setAttachment, manual, admin }: {
  open: boolean,
  close: (e: boolean) => void,
  attachment: string,
  setDetails: (e: string) => void,
  submit: () => void,
  setAttachment: (e: string) => void,
  manual?: boolean,
  admin?: boolean
}) {

  const [viewAttachment, setViewAttachment] = useState<boolean>(false)

  const handleImageFile = async (image: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = function () {
      setAttachment(reader.result as string)
    };
    reader.onerror = function (error) {
      message.error("Unable to get the file!")
    };
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(e) => close(e)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a problem</DialogTitle>
            <DialogDescription>
              If you are experiencing any issues or have encountered a problem, please provide us with the details below. Your feedback helps us improve our service. Thank you for your cooperation.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea onChange={(e) => setDetails(e.target.value)} placeholder='describe the issue...' />
            <br />
            {
              attachment.length > 0 ? (
                <div className="border rounded-lg flex items-center gap-4 text-sm p-4">
                  <div className="flex items-center gap-4 cursor-pointer hover:underline" onClick={() => setViewAttachment(true)}>
                    <Paperclip className="w-4 h-4" />
                    <p>{attachment.length > 0 ? "Attachment" : "Attach image"}</p>
                  </div>
                  {
                    manual && (
                      <>
                        <div className="flex-grow"></div>
                        <X className="text-red-500 w-4 h-4 cursor-pointer" onClick={() => setAttachment("")} />
                      </>
                    )
                  }
                </div>
              ) : (
                <div className="flex w-full">
                  <SingleImageDropzone
                    height={200}
                    width={100}
                    extra="flex-grow flex"
                    className="min-h-[200px] flex-grow"
                    value={attachment}
                    onChange={(file) => {
                      if (file == undefined) {
                        setAttachment("")
                        return
                      }
                      handleImageFile(file)
                    }}
                  />
                </div>
              )
            }
          </div>
          <DialogFooter>
            <Button className={clsx("", {
              "bg-prm":
                !admin
            })} onClick={() => submit()}>Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={viewAttachment} onOpenChange={(e) => setViewAttachment(e)}>
        <DialogContent className="min-w-[100vw] h-[100vh] flex justify-center bg-transparent overflow-y-scroll scroll" customclose="text-white">
          <br />
          <img src={attachment} alt="" />
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ErrorFeedback({
  error,
  code,
  subtitle,
  fatal = false,
  admin = false
}: {
  error: string,
  code: string,
  subtitle?: string | React.ReactNode,
  fatal?: boolean, admin?: boolean
}) {

  // states
  const [openReportModal, setOpenReportModal] = useState<boolean>(false)

  // values
  const [reportImage, setReportImage] = useState<string>("")
  const [reportDetails, setReportDetails] = useState<string>("")

  useEffect(() => {
    const target = document.body
    html2canvas(target).then(canvas => {
      const imageURL = canvas.toDataURL("image/png");
      setReportImage(imageURL)
    })
  }, [])

  const submit = async () => {
    if (reportDetails.length == 0) {
      message.error("Please describe the issue to help us fix the problem.")
      return
    }
    if (reportImage.length == 0) {
      message.error("Please attach an image of your concern to help us fix the problem.")
      return
    }
    submitReport(error, code, reportDetails, reportImage, (fatal ? "Fatal" : "Minor"))

    const reported = sessionStorage.getItem("errors")

    if (reported) {
      sessionStorage.setItem('errors', JSON.stringify([...JSON.parse(reported), code]))
    } else {
      sessionStorage.setItem("errors", JSON.stringify([code]))
    }

    message.success("Submitted a error report.")
    setOpenReportModal(false)
    close()
  }

  return (
    <>
      <Result
        status={fatal ? "500" : "error"}
        title="Unknown error occured!"
        subTitle={<>
          <p className="text-sm text-gray-500">code: {code}</p>
          <p className="text-sm text-gray-500">{subtitle || "Sorry, an unknown error occured while processing your request."}</p>
        </>}
        extra={<Button className={clsx("", { "bg-prm": !admin })} onClick={() => {
          const reported = sessionStorage.getItem("errors")
          if (reported) {
            const reports = JSON.parse(reported)
            if (reports.some((item: string) => item == code)) { // block if this user submitted the same report already
              message.success("Already submitted the report!")
              return
            }
          }
          setOpenReportModal(true)
        }}>Report the problem</Button>}
      />
      <ErrorReportModal
        open={openReportModal}
        close={setOpenReportModal}
        attachment={reportImage}
        setDetails={setReportDetails}
        submit={submit}
        setAttachment={setReportImage}
      />
    </>
  )
}