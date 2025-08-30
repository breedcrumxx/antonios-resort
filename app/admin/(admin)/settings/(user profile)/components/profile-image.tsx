'use client'

import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { Images } from "lucide-react";
import Image from 'next/image';
import { useState } from "react";
import ImageUploader from "./image-uploader";
import { defaultprofile } from "@/lib/configs/config-file";

export default function ProfileImage({ user }: { user: UserSession }) {

  // states
  const [operation, setOperation] = useState<string>("")

  return (
    <>
      <div className="w-max relative">
        <div className="w-[150px] h-[150px] rounded-[50%] relative overflow-hidden bg-gray-500 cursor-pointer" onClick={() => setOperation("view")}>
          <Image
            fill
            src={user.image.length > 0 ? user.image : defaultprofile}
            alt="profile-image"
            className="aspect-square object-contain"
          />
        </div>
        <div className="absolute bottom-1 right-1 z-10 rounded-[50%] p-2 border bg-white cursor-pointer" onClick={() => setOperation("upload")}>
          <Images className="w-5 h-5" />
        </div>
      </div>
      <Dialog open={operation.length > 0} onOpenChange={(e) => setOperation("")}>
        <DialogContent className="flex flex-col items-center">
          {
            operation == "view" ? (
              <div className="w-[300px] h-[300px] relative overflow-hidden bg-gray-500 cursor-pointer" onClick={() => setOperation("view")}>
                <Image
                  fill
                  src={user.image.length > 0 ? user.image : defaultprofile}
                  alt="profile-image"
                  className="aspect-square object-contain"
                />
              </div>
            ) : (
              <ImageUploader user={user} close={() => setOperation("")} />
            )
          }
        </DialogContent>
      </Dialog>
    </>
  )
}