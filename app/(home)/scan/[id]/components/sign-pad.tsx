'use client'

import { Button } from "@/app/components/ui/button"
import { DialogFooter } from "@/app/components/ui/dialog"
import { message } from "antd"
import { useEffect, useRef, useState } from "react"
import SignaturePad from 'signature_pad'

export default function SignPad({
  setSign,
  close,
}: {
  setSign: (image: string) => void
  close: () => void
}) {

  const ref = useRef<HTMLCanvasElement>(null)

  // state 
  const [padInstance, setPadInstance] = useState<SignaturePad | null>(null)

  useEffect(() => {
    if (ref && ref.current) {
      const signaturePad = new SignaturePad(ref.current);
      setPadInstance(signaturePad)
      signaturePad.on();
    }

    return () => {
      padInstance?.off()
    }
  }, [ref])

  const saveSign = () => {
    if (!padInstance) {
      message.error("Unknown error occured!")
      return
    }
    if (padInstance?.isEmpty()) {
      message.error("Please provide your signature!")
      return
    }

    console.log(padInstance.toDataURL())
    setSign(padInstance.toDataURL() as string)
  }

  return (
    <>
      <canvas ref={ref} id="signpad" width={300} height={300}>
      </canvas>
      <DialogFooter>
        <Button variant={"outline"} onClick={() => padInstance?.clear()}>
          Clear
        </Button>
        <Button
          className="bg-prm"
          onClick={() => saveSign()}
        >Set</Button>
      </DialogFooter>
    </>
  )
}