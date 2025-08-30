'use client'

import { Spinner } from "@nextui-org/spinner"
import { AnimatePresence, motion } from "framer-motion"

export default function LoadingCurtain({ open, custom }: { open: boolean, custom?: React.ReactNode }) {

  return (
    <AnimatePresence>
      {
        open && (
          <motion.div
            className="absolute h-full w-full flex justify-center items-center top-0 left-0 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {
              custom ? (
                custom
              ) : (
                <Spinner label="Picking up scattered data..." />
              )
            }
          </motion.div>
        )
      }
    </AnimatePresence>
  )
}