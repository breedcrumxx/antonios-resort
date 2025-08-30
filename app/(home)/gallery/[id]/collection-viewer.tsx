'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { deleteCollection, removeSomeImages } from '@/lib/actions/gallery-actions/gallery-actions';
import { EdgeStoreProvider } from '@/lib/edgestore';
import CoolDownDialog from '@/lib/utils/cooldown-dialog';
import FullCoverLoading from '@/lib/utils/full-cover-loading';
import { collection } from '@/lib/zod/z-schema';
import { message } from 'antd';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import 'yet-another-react-lightbox/styles.css';
import { z } from 'zod';
import AddCollection from '../components/add-collection';

export default function CollectionViewer({ user }: { user: UserSession | null }) {

  const router = useRouter()

  // states
  const [index, setIndex] = useState<number>(-1)
  const [loading, setLoading] = useState<string>("")
  const [editImage, setEditImage] = useState<boolean>(false)
  const [deleteModal, setDeleteModal] = useState<boolean>(false)
  const [errorModal, setErrorModal] = useState<string>("")

  // values
  const [data, setData] = useState<z.infer<typeof collection> | null>(null)
  const [removable, setRemovable] = useState<string[]>([])

  useEffect(() => {

    const item = localStorage.getItem("view")
    if (!item) {
      router.push("/gallery")
      return
    }
    setData(JSON.parse(item))
  }, []);

  const deleteCurrentCollection = async () => {
    if (!data) {
      message.error("Unknown error occured, please try again later!")
      return
    }

    setLoading("Deleting collection...")
    const response = await deleteCollection(data)
    setLoading("")

    if (response.status == 500) {
      message.error("Unable to delete this collection, please try again later!")
      return
    }

    message.success("Collection deleted!")
    router.push("/gallery")
  }

  const removeImages = async () => {
    if (!data) {
      message.error("Unknown error occured, please try again later!")
      return
    }

    if (data.images.length - removable.length < 4) {
      setErrorModal("A collection needs at least 4 images!")
      return
    }

    // get the current available images
    const restImages = data.images.filter((item) => !removable.some((x) => x == item))

    setLoading("Removing some images...")
    const response = await removeSomeImages(data.id, restImages, removable)
    setLoading("")

    if (response.status == 500) {
      message.error("Unable to remove some images, please try again later!")
      return
    }

    const updated = {
      ...data,
      images: restImages
    }

    setData(updated)

    localStorage.setItem("view", JSON.stringify(updated))

    message.success("Collection deleted!")
  }

  return (
    <div className="min-w-screen min-h-screen py-10">
      <div className="w-full flex justify-center">
        <div className="w-[1000px] relative">
          <div className="py-10">
            <h1 className="text-center elegant text-4xl sm:text-6xl font-bold">{data?.collectionname}</h1>
            <p className="text-center">{data?.collectiondescription}</p>
          </div>
          {
            user && user.role.websitecontrol && (
              <div className="absolute top-0 right-0 gap-4 hidden sm:flex">
                <EdgeStoreProvider>
                  <AddCollection data={data} onEdit />
                </EdgeStoreProvider>
                <p className="hover:underline cursor-pointer whitespace-nowrap text-red-500" onClick={() => setEditImage(true)}>Remove image</p>
                <p className="hover:underline cursor-pointer text-red-500" onClick={() => setDeleteModal(true)}>Delete</p>
              </div>
            )
          }
          <div
            id="gallery"
            className="gallery grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 sm:px-0"
          >
            {
              (() => {
                const images: string[][] = [[], [], []]
                let n = 0
                data?.images.forEach((item) => {
                  images[n].push(item)
                  if (n == 2) {
                    n = 0
                    return
                  }
                  n++
                })
                return (
                  <>
                    {
                      images.map((item, i) => (
                        <div
                          className="hidden sm:block space-y-4"
                          key={i}>
                          {
                            item.map((x, y) => (
                              <img
                                className="w-full aspect-auto cursor-pointer"
                                src={x}
                                alt={`img-${i}`}
                                onClick={() => setIndex(i)}
                                key={y}
                              />
                            ))
                          }
                        </div>
                      ))
                    }
                  </>
                )
              })()
            }
            {
              (() => {
                const images: string[][] = [[], []]
                let n = 0
                data?.images.forEach((item) => {
                  images[n].push(item)
                  if (n == 1) {
                    n = 0
                    return
                  }
                  n++
                })
                return (
                  <>
                    {
                      images.map((item, i) => (
                        <div
                          className="block sm:hidden space-y-4"
                          key={i}>
                          {
                            item.map((x, y) => (
                              <img
                                className="w-full aspect-auto cursor-pointer"
                                src={x}
                                alt={`img-${i}`}
                                onClick={() => setIndex(i)}
                                key={y}
                              />
                            ))
                          }
                        </div>
                      ))
                    }
                  </>
                )
              })()
            }
          </div>

          <Lightbox
            index={index}
            plugins={[Counter, Thumbnails]}
            counter={{ container: { style: { top: "unset", bottom: 0 } } }}
            slides={data?.images.map((item) => ({ src: item }))}
            open={index >= 0}
            close={() => setIndex(-1)}
          />


          <Dialog open={editImage} onOpenChange={(e) => setEditImage(e)}>
            <DialogContent className="flex flex-col min-w-[80vw] max-w-[80vw] max-h-[90vh] overflow-hidden">
              <div className="flex flex-wrap justify-center gap-5 overflow-y-auto scroll">
                {
                  data?.images.map((item, i) => (
                    <img
                      className={clsx("max-h-[300px] aspect-auto rounded-lg cursor-pointer", {
                        "grayscale": removable.some((x) => x == item)
                      })}
                      src={item}
                      alt={`img-${i}`}
                      key={i}
                      onClick={() => {
                        // if in the array, remove it
                        if (removable.some((x) => item == x)) {
                          setRemovable((prev) => prev.filter((x) => x != item))
                        } else {
                          // if not in the array, add it
                          setRemovable((prev) => ([...prev, item]))
                        }
                      }}
                    />
                  ))
                }
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditImage(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => removeImages()}
                  disabled={removable.length == 0}
                >Remove ({removable.length})</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={errorModal.length > 0} onOpenChange={(e) => setErrorModal("")}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-500">Request not permitted!</DialogTitle>
                <DialogDescription>{errorModal}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className="bg-prm"
                  onClick={() => setErrorModal("")}
                >Understood</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {
            deleteModal && (
              <CoolDownDialog
                open={deleteModal}
                close={() => setDeleteModal(false)}
                title="Delete a collection"
                description="Clients will never gonna see beautiful memory from this collection, continue to delete?"
                accept={() => deleteCurrentCollection()}
              />
            )
          }

          <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
        </div>
      </div>
    </div>
  );
};
