'use client'

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { MultiFileDropzone, type FileState } from "@/app/components/upload-dropdown/multi-file-dropzone"
import { createNewCollection, updateCollection } from "@/lib/actions/gallery-actions/gallery-actions"
import { useEdgeStore } from "@/lib/edgestore"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { collection } from "@/lib/zod/z-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { message } from "antd"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function AddCollection({ data, onEdit }: { data?: z.infer<typeof collection> | null, onEdit?: boolean }) {

  const router = useRouter()
  const { edgestore } = useEdgeStore();

  const ref = useRef<HTMLFormElement>(null)

  // states
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // values
  const [fileStates, setFileStates] = useState<FileState[]>([]);

  const createcollection = collection.omit({ id: true, createdat: true })

  const form = useForm<z.infer<typeof createcollection>>({
    resolver: zodResolver(createcollection),
    defaultValues: {
      collectionname: data?.collectionname || "",
      collectiondescription: data?.collectiondescription || "",
      images: data?.images || []
    }
  })

  useEffect(() => {
    if (data) {
      form.setValue('collectionname', data.collectionname)
      form.setValue('collectiondescription', data.collectiondescription)
      form.setValue('images', data.images)
    }

  }, [data, form])


  function updateFileProgress(key: string, progress: FileState['progress']) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key,
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  async function onSubmit(values: z.infer<typeof createcollection>) {
    setLoading(true)

    let response = null
    let state = onEdit ? "update" : "create"

    if (onEdit) {
      if (!data) {
        setLoading(false)
        message.error("An unknown error occured, please try again later!")
        return
      }

      response = await updateCollection({ ...data, ...values })

    } else {
      response = await createNewCollection(values)
    }
    setLoading(false)

    if (response.status == 500) {
      message.error(`Unable to ${state} the collection, an error occured!`)
      return
    }

    message.success(`Collection ${state}d!`)

    setOpenModal(false)

    if (onEdit) router.push("/gallery")

  }

  return (
    <>
      <div className={clsx("flex items-center justify-center border-dashed border-[3px] hover:bg-mured/40 cursor-pointer hover:scale-[1.01] transition-all", {
        "hidden": onEdit
      })} onClick={() => setOpenModal(true)}>
        <p>New collection</p>
      </div>
      <p className={clsx("hover:underline cursor-pointer text-blue-500", {
        "hidden": !onEdit
      })} onClick={() => setOpenModal(true)}>Edit</p>
      <Dialog open={openModal} onOpenChange={(e) => setOpenModal(e)}>
        <DialogContent className={"max-h-[80vh] flex flex-col overflow-hidden"}>
          <DialogHeader>
            <DialogTitle>Create a new collection</DialogTitle>
            <DialogDescription>Memories to show to previous and new clients of Antonio&apos;s Resort</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="flex-grow space-y-2 p-2 overflow-y-auto scroll relative">
              <FormField
                control={form.control}
                name="collectionname"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Collection name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="collection name..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="collectiondescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="brief description..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm opacity-70">{onEdit ? "Upload more images." : "Upload at least 4 images, maximum of 50 images."}</p>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MultiFileDropzone
                        dropzoneOptions={{
                          accept: { 'image/*': [] },
                          maxFiles: 50,
                        }}
                        value={fileStates}
                        onChange={(files) => {
                          setFileStates(files);
                        }}
                        onFilesAdded={async (addedFiles) => {
                          setFileStates([...fileStates, ...addedFiles]);
                          await Promise.all(
                            addedFiles.map(async (addedFileState) => {
                              try {
                                const res = await edgestore.publicImages.upload({
                                  file: addedFileState.file,
                                  onProgressChange: async (progress) => {
                                    updateFileProgress(addedFileState.key, progress);
                                    if (progress === 100) {
                                      // wait 1 second to set it to complete
                                      // so that the user can see the progress bar at 100%
                                      await new Promise((resolve) => setTimeout(resolve, 500));
                                      updateFileProgress(addedFileState.key, 'COMPLETE');
                                    }
                                  },
                                  options: {
                                    temporary: true,
                                  }
                                });

                                field.value.push(res.url)
                              } catch (err) {
                                updateFileProgress(addedFileState.key, 'ERROR');
                              }
                            }),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div>
          </div>
          <DialogFooter>
            <Button className="bg-prm"
              onClick={() => {
                ref.current?.requestSubmit()
              }}
              disabled={fileStates.some((item) => (item.progress !== "COMPLETE" && item.progress !== "ERROR"))}
            >{onEdit ? "Update collection" : "Create collection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel={`${onEdit ? "Updating" : "Creating"} the collection...`} />
    </>
  )

}