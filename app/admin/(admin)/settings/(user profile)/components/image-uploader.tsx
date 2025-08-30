'use client'

import { Button } from "@/app/components/ui/button";
import { DialogFooter } from "@/app/components/ui/dialog";
import { SingleImageDropzone } from "@/app/components/upload-dropdown/image-dropzone";
import { uploadProfileImage } from "@/lib/actions/account-actions/upload-profile-image";
import FullCoverLoading from "@/lib/utils/full-cover-loading";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cropper from 'react-easy-crop';
import getCroppedImg from "./crop-utils";

export default function ImageUploader({ user, close }: { user: UserSession, close: () => void }) {
  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showImage, setShowImage] = useState<boolean>(true)

  // values
  const [croppedImage, setCroppedImage] = useState<string>("")
  const [file, setFile] = useState<string>("");

  const handleImageFile = async (image: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = function () {
      setFile(reader.result as string)
      setShowImage(false)
    };
    reader.onerror = function (error) {
      message.error("Unable to get the file!")
    };
  }

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCroppedImage = async () => {
    try {
      const cropted = await getCroppedImg(
        file,
        croppedAreaPixels,
        rotation
      )
      console.log(cropted)
      setCroppedImage(cropted)
      setShowImage(true)
    } catch (e) {
      message.error("Unable to crop the image, try again later!")
    }
  }

  const handleUploadImage = async () => {

    setLoading(true)

    const response = await uploadProfileImage(user.id, croppedImage, user.image)
    setLoading(false)

    if (response.status == 500) {
      message.error("Unable to upload the image, please try again later!")
      return
    }

    message.success("Uploaded successfully!")
    router.refresh()
    close()
  }


  return (
    <>
      {
        !showImage ? (
          <>
            <div className="w-full aspect-square relative overflow-hidden">
              <Cropper
                image={file}
                crop={crop}
                rotation={rotation}
                zoom={zoom}
                aspect={3 / 3}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => showCroppedImage()}>Crop</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <SingleImageDropzone
              width={300}
              height={300}
              value={croppedImage}
              onChange={(file) => {
                if (file == undefined) {
                  setCroppedImage("")
                  return
                }
                handleImageFile(file as File);
              }}
            />
            <DialogFooter>
              <Button onClick={() => handleUploadImage()} disabled={croppedImage.length == 0}>Upload</Button>
            </DialogFooter>
          </>
        )
      }
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Uploading, please wait..." />
    </>
  )
}