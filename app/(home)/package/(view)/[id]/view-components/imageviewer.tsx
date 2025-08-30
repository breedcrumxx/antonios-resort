'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { Skeleton } from "@/app/components/ui/skeleton";
import { usePackageData } from "@/app/providers/package-data-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MousePointerClick } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import 'yet-another-react-lightbox/styles.css';
const ImagePlayground = dynamic(() => import('./image-playground'), {
  loading: () => (
    <div className="grid grid-cols-3 gap-2">
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
      <div
        className="bg-gray-300 h-[150px] flex items-center justify-center relative overflow-hidden"
      >
      </div>
    </div>
  )
})
const Lightbox = dynamic(() => import('yet-another-react-lightbox'))

export default function ImageViewer({ edit }: {
  edit?: {
    images: string[],
    packagename: string,
    packageid: string,
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  }
}) {

  const { packagedata } = usePackageData()

  // states
  const [openImageEditor, setOpenImageEditor] = useState<boolean>(false)
  const [index, setIndex] = useState<number>(-1)

  return (
    packagedata || edit ? (
      <>
        <div className="w-full h-12 flex items-center px-4 bg-white">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/package">Offers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {
                packagedata ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{packagedata?.packagename}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : edit && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/package/${edit.packageid}`}>{edit?.packagename}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Edit {edit?.packagename}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )
              }
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div id="gallery" className="h-[300px] px-4 sm:px-0 w-full grid grid-cols-4 grid-rows-3 sm:grid-cols-5 sm:grid-rows-2 gap-2 overflow-hidden rounded-lg relative">
          {
            edit && (
              <Button
                variant={'outline'}
                size={"sm"}
                className="absolute z-10 rounded-full top-4 left-4"
                onClick={() => setOpenImageEditor(true)}
              >Edit gallery</Button>
            )
          }
          <div className="col-span-2 row-span-2 bg-gray-500 flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[0] || edit?.images[0]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(0)}
              alt="" />
          </div>
          <div className="bg-gray-500 flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[1] || edit?.images[1]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(1)}
              alt="" />
          </div>
          <div className="bg-gray-500 flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[2] || edit?.images[2]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(2)}
              alt="" />
          </div>
          <div className="bg-gray-500 col-span-2 row-span-2 sm:col-span-1 sm:row-span-1  flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[3] || edit?.images[3]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(3)}
              alt="" />
          </div>
          <div className="bg-gray-500 flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[4] || edit?.images[4]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(4)}
              alt="" />
          </div>
          <div className="bg-gray-500 flex items-center justify-center relative overflow-hidden">
            <img
              src={packagedata?.images[5] || edit?.images[5]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(5)}
              alt="" />
          </div>
          <div className="bg-gray-500 hidden sm:flex items-center justify-center relative overflow-hidden">
            {
              ((packagedata?.images.length || 0) > 7) && (
                <div className="absolute h-full w-full flex justify-center items-center top-0 left-0 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 z-10 cursor-pointer group" onClick={() => setIndex(6)}>
                  <p className="font-bold text-xl text-white group-hover:scale-[1.3] transition-all">+ {(packagedata?.images.length || edit?.images.length || 0) - 7}</p>
                </div>
              )
            }
            <img
              src={packagedata?.images[6] || edit?.images[6]}
              className="object-cover object-center h-full w-full hover:brightness-50 hover:contrast-100 cursor-pointer"
              onClick={() => setIndex(6)}
              alt="" />
          </div>
        </div>

        <Lightbox
          index={index}
          plugins={[Counter, Thumbnails]}
          counter={{ container: { style: { top: "unset", bottom: 0 } } }}
          slides={packagedata?.images.map((item) => ({ src: item })) || edit?.images.map((item) => ({ src: item }))}
          open={index >= 0}
          close={() => setIndex(-1)}
        />

        <Dialog open={openImageEditor} onOpenChange={(e) => setOpenImageEditor(e)}>
          <DialogContent className="min-w-[80vw] min-h-[80vh] max-w-[80vw] max-h-[80vh] flex overflow-hidden" disableclose enablex>
            <div className="flex-grow flex gap-2">
              <div className="h-full w-1/4 border-r">
                <div className="h-full flex flex-col">
                  <h1 className="font-bold">How it works?</h1>
                  <ol className="list-decimal text-sm pl-4">
                    <li>Upload <span className="font-bold">at least 7 images</span> to complete the package gallery.</li>
                    <li>First 4 images will serve as the <span className="font-bold">preview in the offers page.</span></li>
                    <li>First 7 images will be the <span className="font-bold">gallery preview.</span></li>
                    <li>You can have a <span className="font-bold">maximum of 10 images</span> per gallery.</li>
                  </ol>
                  <div className="flex-grow"></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="m-1" />
                      <span className="text-sm">Select</span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Enter</Button>
                      <span className="text-sm">Confirm</span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Esc</Button>
                      <span className="text-sm">Cancel</span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Del</Button>
                      <span className="text-sm">Remove image</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <div className="border rounded-sm w-max p-2 hover:bg-muted/50">
                          <ArrowUp />
                        </div>
                      </div>
                      <div className="flex justify-center gap-2">
                        <div className="border rounded-sm w-max p-2 hover:bg-muted/50">
                          <ArrowLeft />
                        </div>
                        <div className="border rounded-sm w-max p-2 hover:bg-muted/50">
                          <ArrowDown />
                        </div>
                        <div className="border rounded-sm w-max p-2 hover:bg-muted/50">
                          <ArrowRight />
                        </div>
                      </div>
                      <p className="text-center text-sm">Move around</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto scroll">
                <EdgeStoreProvider>
                  <ImagePlayground
                    images={edit?.images || []}
                    setImages={edit?.setImages || undefined}
                    allow={edit != undefined}
                  />
                </EdgeStoreProvider>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    ) : (
      <div className="h-[300px] w-full grid grid-cols-4 grid-rows-3 sm:grid-cols-5 sm:grid-rows-2 px-4 sm:px-0 gap-2 overflow-hidden rounded-lg relative">
        <Skeleton className="col-span-2 row-span-2 bg-gray-400" />
        <Skeleton />
        <Skeleton />
        <Skeleton className="col-span-2 row-span-2 sm:col-span-1 sm:row-span-1" />
        <Skeleton />
        <Skeleton />
        <Skeleton className="hidden sm:block bg-gray-400" />
      </div>
    )
  )
}