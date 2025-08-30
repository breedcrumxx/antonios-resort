'use client'
import { CustomImageDropzone } from "@/app/components/ui/custom-dropzone"
import { useEdgeStore } from "@/lib/edgestore"
import { message } from "antd"
import clsx from "clsx"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function ImagePlayground({
  images,
  setImages
}: {
  images: string[],
  allow?: boolean,
  setImages?: React.Dispatch<React.SetStateAction<string[]>>
}) {

  // context
  const { edgestore } = useEdgeStore()

  // states
  const [target, setTarget] = useState<number | null>(null)
  const [current, setCurrent] = useState<number | null>(null)

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {

      if (target == null || current == null) return

      // enter hit
      if (e.key === "Enter") {
        // get the target 
        const newSources = images
        const swap1 = newSources[target]
        const swap2 = newSources[current]
        newSources[current] = swap1
        newSources[target] = swap2

        // clean up
        setTarget(null)
        setCurrent(null)

        setImages?.(newSources)

        return
      }

      if (e.key === "Escape") {
        // clean up
        setTarget(null)
        setCurrent(null)
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (images.length <= 7) {
          message.error("7 images required!")
          return
        }

        // delete image
        const newSources = images
        newSources.splice(target, 1)
        setImages?.(newSources)

        // clean up
        setTarget(null)
        setCurrent(null)
        return
      }

      let pos = current

      if (e.key === "ArrowLeft") {
        if (pos == 0) return // prevent offset 0
        pos = pos - 1
      } else if (e.key === "ArrowRight") {
        if (pos == images.length - 1) return // prevent offset max
        pos = pos + 1
      } else if (e.key === "ArrowUp") {
        if (pos - 3 < 0) return // prevent offset 0
        pos = pos - 3
      } else if (e.key === "ArrowDown") {
        if (pos + 3 > images.length - 1) return // prevent offset max
        pos = pos + 3
      }

      setCurrent(pos)
    };

    if (target != null) {
      window.addEventListener("keydown", handleKeydown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown); // Clean up listener when `target` changes or component unmounts
    };
  }, [target, current, images]);

  return (
    <>
      <div
        className="grid grid-cols-3 gap-2"
      >
        {
          images.length < 10 && (
            <CustomImageDropzone
              className="w-full"
              customContent="Upload images here"
              dropzoneOptions={{
                maxFiles: 10 - images.length
              }}
              onFilesAdded={async (addedFiles) => {
                await Promise.all(
                  addedFiles.map(async (addedFileState) => {
                    try {
                      const res = await edgestore.publicImages.upload({
                        file: addedFileState.file as File,
                        options: {
                          temporary: true,
                        }
                      });
                      setImages?.((prev) => ([...prev, res.url]))
                    } catch (err) {
                      message.error("Unable to upload the image!")
                    }
                  }),
                );
              }}
            />
          )
        }
        {
          images.map((item, i) => (
            <motion.div
              key={item} // Use the image as the key for unique identification
              className={clsx("bg-gray-300 h-[150px] w-full flex items-center justify-center relative overflow-hidden cursor-pointer")}
              layout // Enable Framer Motion's layout animation
              // initial={{ opacity: 0, x: 100 }} // Start off-screen
              animate={{ opacity: 1, x: 0 }} // Move into view
              exit={{ opacity: 0, x: -100 }} // Exit off-screen to the left
              transition={{ duration: 0.5 }} // Smooth transition timing
              onClick={() => {
                setTarget(i)
                setCurrent(i)
              }}
            >
              <motion.img
                src={item}
                className={clsx("object-cover object-center h-full w-full", {
                  "brightness-100 contrast-50": i == current && i != target,
                  "brightness-50 contrast-100": i == target
                })}
                alt=""
              />
            </motion.div>
          ))
        }
      </div>
    </>
  )
}