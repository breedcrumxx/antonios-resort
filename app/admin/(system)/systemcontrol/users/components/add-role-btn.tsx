'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent } from "@/app/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Switch } from "@/app/components/ui/switch"
import { useToast } from "@/app/components/ui/use-toast"
import { createNewRole, editRole } from "@/lib/actions/account-actions/create-new-role"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { role } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from 'antd'
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function AddRoleButton() {

  const { toast } = useToast()

  // states
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openForms, setOpenForms] = useState<boolean>(false)
  const [formLoading, setFormLoading] = useState<string>("")
  const [rolesFetching, setRolesFetching] = useState<boolean>(true)
  const [editMode, setEditMode] = useState<z.infer<typeof role> | null>(null)

  // values
  const [activeRoles, setActiveRoles] = useState<z.infer<typeof role>[]>([])

  const createrole = role.omit({ id: true })

  const form = useForm<z.infer<typeof createrole>>({
    resolver: zodResolver(createrole),
    defaultValues: {
      role: "",
      systemcontrol: false,
      businesscontrol: false,
      websitecontrol: false,
      utilityaccess: false,
      websiteaccess: true,
    }
  })

  const fetchData = async () => {
    try {
      const response = await fetch("/api/users/roles", { method: "GET" })

      if (!response.ok) throw new Error()

      const result = await response.json()
      setActiveRoles(result)
    } catch (error) {
      message.error("Unable to fetch roles, please try again later!")
    }
    setRolesFetching(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (editMode) {
      form.setValue("role", editMode.role)
      form.setValue("systemcontrol", editMode.systemcontrol)
      form.setValue("businesscontrol", editMode.businesscontrol)
      form.setValue("websitecontrol", editMode.websitecontrol)
      form.setValue("utilityaccess", editMode.utilityaccess)
      form.setValue("websiteaccess", editMode.websiteaccess)
      setOpenForms(true)
    }
  }, [editMode])

  const onSubmit = async (values: z.infer<typeof createrole>) => {

    if (editMode) { // if the edit mode has value, then update
      setFormLoading("Updating role, please wait...")
      const response = await editRole({ ...values, id: editMode.id })
      setFormLoading("")

      if (response.status == 500) {
        toast({
          title: "An error occured!",
          description: "Unable to update the role, please try again later!",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Update success!",
        description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
      })
    } else { // create a new role

      if (activeRoles.some((item) => item.role.toLowerCase() === values.role.toLowerCase())) {
        message.error("Role already exist!")
        return
      }

      setFormLoading("Creating new role, please wait...")
      const response = await createNewRole(values as z.infer<typeof role>)
      setFormLoading("")

      if (response.status == 500) {
        toast({
          title: "An error occured!",
          description: "Unable to create the role, please try again later!",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Created successfully!",
        description: format(new Date(), "EEEE MMMM, dd yyyy 'at' h:mm a"),
      })
    }

    form.reset()
    setOpenForms(false)
    fetchData()
  }

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>View roles</Button>
      <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
        <DialogContent className="min-w-[60vw] min-h-[80vh] max-w-[60vw] max-h-[80vh] flex">
          <div className="w-1/3 border-r">
            <Label>Roles</Label>
            <div className="pr-4 space-y-2">
              {
                rolesFetching ? (
                  <>
                    <Skeleton className="h-8 w-full bg-gray-200" />
                    <Skeleton className="h-8 w-full bg-gray-200" />
                    <Skeleton className="h-8 w-full bg-gray-200" />
                    <Skeleton className="h-8 w-full bg-gray-200" />
                  </>
                ) : (
                  <>
                    {
                      activeRoles.map((item, i) => (
                        <Button className="w-full" key={i} onClick={() => setEditMode(item)}>{item.role}</Button>
                      ))
                    }
                    {
                      activeRoles.length == 0 && (
                        <p className="text-center my-10 opacity-70 text-sm">No active roles...</p>
                      )
                    }
                  </>
                )
              }
              <Button className="w-full" variant={"outline"} onClick={() => {
                form.reset()
                setEditMode(null)
                setOpenForms(true)
              }}>Add role</Button>
            </div>
          </div>

          {
            openForms ? (
              <div className="w-2/3 flex flex-col overflow space-y-4">
                <Label>Create new role</Label>
                <div className="w-full space-y-4 p-2 pr-4 overflow-y-scroll scroll">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                      <FormField
                        name="role"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Role" readOnly={editMode ? true : false} />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>Given name for this role.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        name="websiteaccess"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Switch id="website-access"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled
                                />
                              </FormControl>
                              <FormLabel htmlFor="website-access">Website access</FormLabel>
                            </div>
                            <FormDescription>Permission granted to access the website and it&apos;s core functionality. (default on)</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        name="systemcontrol"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Switch id="system-control"
                                  checked={field.value}
                                  onCheckedChange={(e: boolean) => {
                                    field.onChange(e)
                                    form.setValue('businesscontrol', false)
                                  }}
                                />
                              </FormControl>
                              <FormLabel htmlFor="system-control">System control <span className="text-xs text-red-500"> * Only one high access-level can be granted</span></FormLabel>
                            </div>
                            <FormDescription>This toggle grants permission to access and manage critical functionalities of the website, including system configuration, error reports, system logs, and audit trails. It provides the ability to modify system settings, view and handle error reports, monitor detailed logs, and track changes and actions within the system for security and compliance.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        name="businesscontrol"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Switch id="business-control"
                                  checked={field.value}
                                  onCheckedChange={(e: boolean) => {
                                    field.onChange(e)
                                    form.setValue("systemcontrol", false)
                                  }}
                                />
                              </FormControl>
                              <FormLabel htmlFor="business-control">Business control <span className="text-xs text-red-500"> * Only one high access-level can be granted</span></FormLabel>
                            </div>
                            <FormDescription>This toggles serves as the central hub for managing the reservation system&apos;s core functions. It enables the creation and management of packages, oversight of bookings, and management of sales activities.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        name="websitecontrol"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Switch id="website-control"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel htmlFor="website-control">Website control</FormLabel>
                            </div>
                            <FormDescription>Toggle grants permission to manage essential website configurations, including FAQs, important notices, and package creation.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        name="utilityaccess"
                        control={form.control}
                        render={({ field }: any) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Switch id="utility-access"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel htmlFor="utility-access">Utility access</FormLabel>
                            </div>
                            <FormDescription>This toggle grants permission to utilize essential utilities within the website, including scanning bookings and providing website support. This access ensures efficient operational support and assistance, enhancing user service and website functionality.</FormDescription>
                          </FormItem>
                        )}
                      />
                      <Button className="w-full" disabled={editMode?.role == "Client" || editMode?.role == "System admin"}>{editMode ? `${editMode.role == "System admin" || editMode.role == "Client" ? "This role is currently locked!" : "Update role"}` : "Create role"}</Button>
                    </form>
                  </Form>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="opacity-70">Select a role...</p>
              </div>
            )
          }
        </DialogContent>
      </Dialog>
      <FullCoverLoading open={formLoading.length > 0} defaultOpen={false} loadingLabel={formLoading} />
    </>
  )
}