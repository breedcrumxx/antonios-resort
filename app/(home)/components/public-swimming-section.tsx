'use client'

import { logo } from "@/lib/configs/config-file";
import { cn } from "@/lib/utils/cn";
import public1 from '@/public/home-src/public-1.jpg';
import public2 from '@/public/home-src/public-2.jpg';
import public3 from '@/public/home-src/public-3.jpg';
import { motion } from "framer-motion";

export default function PublicSwimmingSection({ className }: { className?: string }) {

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <div className="w-full flex flex-col-reverse py-10 gap-10 px-4 sm:px-0 sm:w-[900px] sm:flex-row sm:py-24">
        <div className="w-full text-center sm:text-left sm:w-1/2 flex flex-col justify-center">
          <img
            className="hidden sm:block w-1/2 mx-auto"
            src={logo} alt="" />
          <h1 className="font-semibold text-center elegant text-2xl">Public Swimming and Cottages</h1>
          <br />
          <p className="text-sm">
            Experience relaxation at its finest with Antonio&apos;s Public Swimming and Cottages. Whether you&apos;re here for a refreshing swim or a peaceful stay in our cozy cottages, we provide the perfect setting for fun, comfort, and unforgettable memories.
          </p>
        </div>

        <div className="w-full flex flex-col items-center sm:w-1/2">
          <motion.div
            variants={imageVariants}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] rounded-xl -ml-20 sm:-ml-0 sm:ml-4 p-1 bg-white flex-shrink-0 overflow-hidden"
          >
            <img
              src={public1.src}
              alt="bali images"
              width="500"
              height="500"
              className="w-full h-full rounded-lg object-cover flex-shrink-0"
            />
          </motion.div>
          <motion.div
            variants={imageVariants}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] ml-40 rounded-xl -mt-[100px] ml-4 sm:ml-32 sm:-mt-8 p-1 bg-white flex-shrink-0 overflow-hidden"
          >
            <img
              src={public2.src}
              alt="bali images"
              width="500"
              height="500"
              className="w-full h-full rounded-lg object-cover flex-shrink-0"
            />
          </motion.div>
          <motion.div
            variants={imageVariants}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] -ml-20 -mt-[100px] rounded-xl sm:ml-4 sm:-mt-8 p-1 bg-white flex-shrink-0 overflow-hidden"
          >
            <img
              src={public3.src}
              alt="bali images"
              width="500"
              height="500"
              className="w-full h-full rounded-lg object-cover flex-shrink-0"
            />
          </motion.div>
        </div>

      </div>
    </div>
  )
}