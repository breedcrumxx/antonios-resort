'use client'

import { logo } from "@/lib/configs/config-file";
import { Spinner } from "@nextui-org/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";

export default function LoadingCover() {
  const [show, setShow] = useState<boolean>(true)

  useEffect(() => {

    return () => {
      setShow(false)
    }
  }, [])

  return (
    // <AnimatePresence>
    //   </AnimatePresence>
    <>
      {show && (
        <motion.div
          className="absolute top-0 left-0 min-w-screen min-h-screen flex items-center justify-center z-[100] -translate-y-[4rem] relative bg-white pointer-events-none">
          {/* <Spinner label="Welcome to Antonio's Resort" /> */}
          <img src={logo} alt="company-logo" className="animate-test  h-[150px] w-[150px]" />
        </motion.div>
      )}
    </>
  )
}