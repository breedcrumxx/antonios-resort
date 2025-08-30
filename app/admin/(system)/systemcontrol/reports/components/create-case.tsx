'use client'

import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { useToast } from "@/app/components/ui/use-toast"
import { createCase } from "@/lib/actions/system-actions/case-action"
import { GITHUB_KEY } from "@/lib/configs/config-file"
import { GithubIssue } from "@/lib/interfaces"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { problemreport } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/spinner"
import { message } from "antd"
import axios from "axios"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from 'zod'


const errorcase = z.object({
  title: z.string()
    .min(1, { message: "Add a label for this case!" })
    .min(5, { message: "Make it a bit descriptive!" }),
  comment: z.string()
    .min(1, { message: "Add a memo for this case!" })
    .min(10, { message: "Make it a bit descriptive!" }),
  includereportinfo: z.boolean(),
  includeall: z.boolean(),
})

export default function CreateCaseModal({ data, close }: { data: z.infer<typeof problemreport>, close: () => void }) {

  // context
  const { toast } = useToast()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchingLabels, setFetchingLabels] = useState<boolean>(true)

  // values
  const [labels, setLabels] = useState<GithubLabel[]>([])
  const [selectedLabels, setSelectedLabels] = useState<GithubLabel[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.github.com/repos/breedcrumxx/antonios/labels`, {
          headers: {
            Authorization: `token ${GITHUB_KEY}`,
            Accept: "application/vnd.github+json"
          }
        })

        setLabels(response.data)
        setFetchingLabels(false)
      } catch (error) {
        message.error("Unable to get github labels!")
        setFetchingLabels(false)
      }
    }

    fetchData()
  }, [])

  const form = useForm<z.infer<typeof errorcase>>({
    resolver: zodResolver(errorcase),
    defaultValues: {
      title: "",
      comment: "",
      includereportinfo: true,
      includeall: false
    }
  })

  const onSubmit = async (values: z.infer<typeof errorcase>) => {
    setLoading(true)

    try {
      const response = await axios.post(`https://api.github.com/repos/breedcrumxx/antonios/issues`,
        {
          title: values.title,
          body: `${values.comment}${values.includereportinfo ? `\n## Sample Attached\n#### Error serial - ${data.code}\n\nError message:\n\`\`\`\n${data.errormessage}\n\`\`\`\n\nError stack trace:\n\`\`\`\n${data.stacktrace}\n\`\`\`\nImage attached to the report\n![Screenshot of a error.](${data.image})` : ``}`,
          assignee: "breedcrumxx",
          labels: selectedLabels.map((item) => item.name),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${GITHUB_KEY}`,
            'accept': 'application/vnd.github+json'
          },
        })

      const issueResponse = await createCase((response.data as GithubIssue).number, data.id, data.code, values.includeall)

      if (issueResponse.status == 500) throw new Error("Unable to set the samples!")
      setLoading(false)
    } catch (error) {
      setLoading(false)
      message.error("Unable to open an issue!")
      return
    }

    toast({
      title: "New case",
      description: format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    })
    close()

  }

  return (
    <>
      <>
        <DialogHeader>
          <DialogTitle>Open New Issue</DialogTitle>
          <DialogDescription>Open a new issue addressing the problem.</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2">

              <FormField
                control={form.control}
                name="title"
                render={({ field }: any) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="issue title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }: any) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="add first comment..." {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Github supports markdown, please read the <Link href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#headings" className="cursor-pointer text-blue-500 hover:underline">Github markdown</Link> documentation.</FormDescription>
                  </FormItem>
                )}
              />

              <div className="w-full flex flex-wrap gap-2">
                {
                  selectedLabels.map((item, i) => (
                    <Badge style={{ backgroundColor: `#${item.color}` }} key={i}>{item.name}</Badge>
                  ))
                }
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-full text-xs"
                      variant={"outline"}
                      disabled={fetchingLabels}>
                      {
                        fetchingLabels ? (
                          <Spinner size="sm" className="mr-1" />

                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )
                      }
                      Labels
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Labels</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {
                      labels.map((item, i) => (
                        <DropdownMenuCheckboxItem
                          checked={selectedLabels.some((x) => x.id == item.id)}
                          onCheckedChange={(e) => {
                            if (e) {
                              setSelectedLabels((prev) => [...prev, item])
                            } else {
                              setSelectedLabels((prev) => prev.filter((x) => x.id != item.id))
                            }
                          }}
                          key={i}
                        >
                          <Badge
                            style={{ backgroundColor: `#${item.color}` }}
                          >
                            {item.name}
                          </Badge>
                        </DropdownMenuCheckboxItem>
                      ))
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <FormField
                control={form.control}
                name="includereportinfo"
                render={({ field }: any) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox id="include" checked={field.checked} onCheckedChange={field.onChange} />
                      </FormControl>
                      <label
                        htmlFor="include"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include this issue info to my comment
                      </label>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeall"
                render={({ field }: any) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox id="all" checked={field.checked} onCheckedChange={field.onChange} />
                      </FormControl>
                      <label
                        htmlFor="all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include all related issue as samples
                      </label>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button>Open new issue</Button>
              </div>
            </form>
          </Form>
        </div>
      </>

      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Opening a new case, please wait..." />
    </>
  )
}