'use client'
import ImageViewer from "@/app/(home)/package/(view)/[id]/view-components/imageviewer";
import { useCustomPackage } from "../provider";
import './style.css';

export default function PackageImageDropper() {

  const {
    imageUrls,
    setImageUrls,
    packageName,
    packageid
  } = useCustomPackage()

  return (
    <>
      <ImageViewer
        edit={{
          images: imageUrls,
          packagename: packageName,
          setImages: setImageUrls,
          packageid: packageid as string
        }}
      />
    </>
  )
}