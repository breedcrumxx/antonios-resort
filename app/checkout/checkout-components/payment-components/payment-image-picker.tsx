'use client'

import { SingleImageDropzone } from "../../../components/upload-dropdown/image-dropzone";
import { useState } from "react";

export default function PaymentImagePicker({ value, onValueChange }: { value: File, onValueChange: (value: File) => void }) {

  return (
    <SingleImageDropzone
      width={200}
      height={200}
      className="min-w-full"
      value={value}
      onChange={(file) => {
        onValueChange(file as File);
      }}
    />
  )
}