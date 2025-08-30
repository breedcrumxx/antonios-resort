'use client'

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/ui/skeleton";
import '@/app/configuration.css';
import { Spinner } from "@nextui-org/spinner";
import { message, Result } from "antd";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { getConfiguration } from "../actions/system-actions/save-website-config";
import { catalog } from "../zod/z-schema";
import { StaleReport } from "./error-report-modal";
import { Checkbox } from "@/app/components/ui/checkbox";

interface PolicyProps extends React.ButtonHTMLAttributes<HTMLSpanElement> {
  content: string,
  title: string,
  interactive?: boolean,
  setInteractive?: (value: boolean) => void,
  singlemode?: boolean,
  setAccept?: (value: boolean) => void,
  asLink?: boolean,
}

const PolicyContainer = React.forwardRef<
  HTMLSpanElement,
  PolicyProps
>(({ className, content, title, interactive = false, setInteractive, singlemode, setAccept, asLink, ...props }, ref) => {

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorReport, setErrorReport] = useState<string>("")
  const [openReportModal, setOpenReportModal] = useState<boolean>(false)
  const [selected, setSelected] = useState<z.infer<typeof catalog> | null>(null)
  const [accepted, setAccepted] = useState<boolean>(false)

  // values
  const [catalogs, setCatalogs] = useState<z.infer<typeof catalog>[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getConfiguration(content)
      setLoading(false)

      if (response.status == 500) {
        setErrorReport(response.error)
        setError(true)
        return
      }
      if (response.status == 404) {
        setErrorReport(JSON.stringify({
          message: "Missing Privacy policy!",
          stack: ""
        }))
        setError(true)
        return
      }

      setCatalogs(response.data)
      setSelected(response.data[0]) // set the default to the first item
    }

    fetchData()
  }, [])

  return (
    <>
      {
        asLink ? (
          <a className="hover:underline cursor-pointer w-max" onClick={() => setOpenModal(true)}>{title}</a>
        ) : (
          <span
            className={className}
            ref={ref}
            {...props}
            onClick={() => setOpenModal(true)}
          >{title}</span>
        )
      }
      <Dialog open={openModal || interactive} onOpenChange={(e) => {
        setOpenModal(e)
        setInteractive?.(false)
      }}>
        <DialogContent className='max-h-[90vh] min-w-[90vw] max-w-[90vw] flex flex-col overflow-hidden sm:px-2'>
          <DialogHeader className="px-2">
            <DialogTitle>{title}</DialogTitle>
            {
              !singlemode && (
                <DialogDescription className="pt-2">
                  {
                    loading ? (
                      <Skeleton className="h-8 w-full sm:w-[250px]" />
                    ) : (
                      <Select defaultValue="latest" onValueChange={(e) => {
                        if (e == "latest") {
                          setSelected(catalogs[0]);
                          return;
                        }
                        setSelected(catalogs.find((item) => item.id == e) as z.infer<typeof catalog>)
                      }}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full sm:w-[250px]">
                          {
                            catalogs.map((item, i) => (
                              <SelectItem
                                className={i == 0 ? "text-green-500" : ''}
                                value={i == 0 ? "latest" : item.id}
                                key={i}
                              >{i == 0 ? "Latest" : format(item.datecreated, "PPP")}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )
                  }
                </DialogDescription>
              )
            }
          </DialogHeader>
          {
            loading ? (
              <div className="min-h-[80vh] flex items-center justify-center">
                <Spinner label="Getting privacy policy..." />
              </div>
            ) : error ? (
              <>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <Result
                    status="404"
                    title="Privacy Policy is missing!"
                    subTitle="We cannot find the privacy policy, we encourage you to not continue until we fix things up."
                    extra={
                      <Button className="bg-prm" onClick={() => {
                        const reported = sessionStorage.getItem("errors")
                        if (reported) {
                          const reports = JSON.parse(reported)
                          if (reports.some((item: string) => item == "CMP-ERR-0007")) {
                            message.success("Submitted an error report.")
                            return
                          }
                        }
                        setOpenReportModal(true)
                      }}>Report the problem</Button>
                    }
                  />
                  <StaleReport
                    open={openReportModal}
                    close={() => {
                      setOpenReportModal(false)
                    }}
                    error={errorReport}
                    code="CMP-ERR-0007"
                  />
                </div>
              </>
            ) : (
              <>
                <div className='h-max w-full space-y-2 px-2 pb-5 text-justify overflow-y-scroll scroll'>
                  <div dangerouslySetInnerHTML={{ __html: selected?.content || "" }}>
                  </div>
                  {
                    interactive && (
                      <div className="flex px-8 font-semibold gap-4 items-center">
                        <Checkbox checked={accepted} onCheckedChange={(e) => setAccepted(e as boolean)} />
                        By checking the box, I understood and agree to the outline statements above.
                      </div>
                    )
                  }
                </div>
              </>
            )
          }
          {
            setAccept && (
              <DialogFooter>
                <Button className="bg-prm" disabled={!accepted} onClick={() => {
                  setAccept(true)
                  setOpenModal(false)
                  setInteractive?.(false)
                }}>Agree</Button>
              </DialogFooter>
            )
          }
        </DialogContent>
      </Dialog>
    </>
  );
});
PolicyContainer.displayName = 'PolicyContainer';

export default PolicyContainer